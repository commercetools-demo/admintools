import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../../utils/logger.utils';
import {
  FileController,
  MediaLibraryResult,
  FileMetadata,
} from '../file-controller';

interface CloudinaryResource {
  public_id: string;
  format: string;
  secure_url: string;
  created_at?: string;
  bytes?: number;
  [key: string]: any;
}

export class CloudinaryFileController implements FileController {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: any,
    path?: string,
    metadata?: FileMetadata
  ): Promise<string> {
    try {
      // Convert buffer to base64
      const base64File = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64File}`;

      const uploadOptions: any = {
        folder: path || 'uploads',
        resource_type: 'auto',
      };

      // Add metadata as context if provided
      if (metadata) {
        const context: string[] = [];
        if (metadata.title) context.push(`title=${metadata.title}`);
        if (metadata.description)
          context.push(`description=${metadata.description}`);

        if (context.length > 0) {
          uploadOptions.context = context.join('|');
        }
      }

      const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

      return result.secure_url;
    } catch (error) {
      logger.error('Failed to upload file to Cloudinary:', error);
      throw new Error('Failed to upload file');
    }
  }

  async getMediaLibrary(
    extensions: string[],
    page: number,
    limit: number
  ): Promise<MediaLibraryResult> {
    try {
      // Cloudinary API allows searching by folder
      const searchParams: any = {
        type: 'upload',
        prefix: 'uploads/',
        max_results: 500, // Max allowed by Cloudinary
      };

      const result = await cloudinary.api.resources(searchParams);
      const resources = (result.resources as CloudinaryResource[]) || [];

      // Filter resources by extensions if provided
      let filteredResources = resources;
      if (extensions.length > 0) {
        filteredResources = resources.filter((resource: CloudinaryResource) => {
          const fileName = resource.public_id.split('/').pop() || '';
          return extensions.some((ext) => {
            // Check if the format or filename ends with the extension
            return (
              resource.format === ext.toLowerCase() ||
              fileName.toLowerCase().endsWith(`.${ext.toLowerCase()}`)
            );
          });
        });
      }

      // Calculate pagination
      const totalItems = filteredResources.length;
      const totalPages = Math.ceil(totalItems / limit);

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const paginatedResources = filteredResources.slice(
        startIndex,
        startIndex + limit
      );

      // Format the resources
      const filePromises = paginatedResources.map(
        async (resource: CloudinaryResource) => {
          const fileName = resource.public_id.split('/').pop() || '';
          const displayName = `${fileName}.${resource.format}`;
          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
            resource.format
          );

          // Fetch context (metadata) for the resource
          try {
            const resourceInfo = await cloudinary.api.resource(
              resource.public_id,
              { context: true }
            );
            let title, description;

            if (resourceInfo.context && resourceInfo.context.custom) {
              title = resourceInfo.context.custom.title;
              description = resourceInfo.context.custom.description;
            }

            return {
              url: resource.secure_url,
              name: displayName,
              title: title ? String(title) : undefined,
              description: description ? String(description) : undefined,
              isImage,
              createdAt: resource.created_at
                ? new Date(resource.created_at)
                : undefined,
              size: resource.bytes,
            };
          } catch (error) {
            // If context fetch fails, return without metadata
            logger.error(
              `Failed to fetch context for resource ${resource.public_id}:`,
              error
            );
            return {
              url: resource.secure_url,
              name: displayName,
              isImage,
              createdAt: resource.created_at
                ? new Date(resource.created_at)
                : undefined,
              size: resource.bytes,
            };
          }
        }
      );

      const files = await Promise.all(filePromises);

      return {
        files,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          limit,
        },
      };
    } catch (error) {
      logger.error('Failed to fetch media library from Cloudinary:', error);
      throw new Error('Failed to fetch media library');
    }
  }
}

import { useState, useCallback } from 'react';
import {
  useMcQuery,
  useMcLazyQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import type { ApolloError } from '@apollo/client';
import gql from 'graphql-tag';

// GraphQL query to get user projects and find the current one
const PROJECT_INFO_QUERY = gql`
  query ProjectInfo {
    myProjects(limit: 500) {
      results {
        key
        owner {
          name
          id
          version
          teams {
            id
            name
          }
        }
      }
    }
  }
`;

// GraphQL query to validate email for invitation
const HAS_VALID_EMAIL_QUERY = gql`
  query HasValidEmailQuery(
    $email: String!
    $organizationId: ID!
    $teamId: ID!
  ) {
    invitation(
      where: { email: $email, organizationId: $organizationId, teamId: $teamId }
    ) {
      hasValidEmail
      __typename
    }
  }
`;

// GraphQL mutation to send invitation
const INVITE_MUTATION = gql`
  mutation InviteMutation($draft: InvitationInput!) {
    invite(draft: $draft) {
      status
      email
      __typename
    }
  }
`;

// Type definitions
interface ProjectOwner {
  name: string;
  id: string;
}

interface OrganizationDetails {
  id: string;
  name: string;
  version: number;
  teams: Array<{
    id: string;
    name: string;
  }>;
}

interface ProjectInfoResponse {
  project: {
    key: string;
    owner: ProjectOwner;
  };
}

interface OrganizationDetailsResponse {
  me: {
    organization: OrganizationDetails;
  };
}

interface ValidationResponse {
  invitation: {
    hasValidEmail: boolean;
    __typename: string;
  };
}

interface InvitationResponse {
  invite: {
    status: string;
    email: string;
    __typename: string;
  };
}

interface InvitationDraft {
  emails: string[];
  organization: {
    id: string;
    version: number;
  };
  team: {
    id: string;
  };
}

interface ProjectInfo {
  key: string;
  owner: {
    name: string;
    id: string;
    version: number;
    teams: {
      id: string;
      name: string;
    }[];
  };
}

interface UserProjectsResponse {
  myProjects: {
    results: ProjectInfo[];
  };
}

interface ProjectDetailsResponse {
  project: {
    key: string;
    owner: {
      name: string;
      id: string;
      __typename: string;
    };
    __typename: string;
  };
}

interface UserResponse {
  me: {
    id: string;
    email: string;
    __typename: string;
  };
}

interface UseMerchantCenterManagementResult {
  loading: boolean;
  error: ApolloError | null;
  inviteSellerToMerchantCenter: (email: string) => Promise<boolean>;
}

const useMerchantCenterManagement = (): UseMerchantCenterManagementResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApolloError | null>(null);

  const { project, environment } = useApplicationContext();
  const currentProjectKey = project?.key;
  const teamName = (environment as any)?.MC_TEAM_NAME;

  // Lazy queries and mutations
  const [getUserProjects] = useMcLazyQuery<UserProjectsResponse>(
    PROJECT_INFO_QUERY,
    {
      context: { target: GRAPHQL_TARGETS.ADMINISTRATION_SERVICE },
    }
  );

  const [validateEmail] = useMcLazyQuery<ValidationResponse>(
    HAS_VALID_EMAIL_QUERY,
    {
      context: { target: GRAPHQL_TARGETS.MERCHANT_CENTER_BACKEND },
    }
  );

  const [sendInvitation] = useMcMutation<InvitationResponse>(INVITE_MUTATION, {
    context: { target: GRAPHQL_TARGETS.MERCHANT_CENTER_BACKEND },
  });

  const inviteSellerToMerchantCenter = useCallback(
    async (email: string): Promise<boolean> => {
      if (!currentProjectKey || !teamName) {
        console.warn(
          '⚠️ Missing project key or team name for Merchant Center invitation'
        );
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(
          '🔍 Step 6.1: Getting user projects for Merchant Center invitation...'
        );
        console.log(`🎯 Looking for project with key: ${currentProjectKey}`);

        // Step 1: Get all user projects (like FetchLoggedInUser does)
        const userProjectsResult = await getUserProjects();

        if (!userProjectsResult.data?.myProjects?.results) {
          throw new Error('Failed to fetch user projects');
        }

        console.log(
          `📋 Found ${userProjectsResult.data.myProjects.results.length} projects`
        );

        // Find the current project by key
        const targetProject = userProjectsResult.data.myProjects.results.find(
          (project) => project.key === currentProjectKey
        );

        if (!targetProject) {
          console.error(
            'Available projects:',
            userProjectsResult.data.myProjects.results.map((p) => p.key)
          );
          throw new Error(
            `Project with key "${currentProjectKey}" not found in user projects`
          );
        }

        const organizationId = targetProject.owner.id;
        const organizationName = targetProject.owner.name;

        console.log(
          `✅ Found organization: ${organizationName} (${organizationId})`
        );

        // The API error told us the actual version is 247, let's use that for now
        // We still need to find a way to get this dynamically
        console.log(
          '🔍 Step 6.3: Using organization version from API error feedback...'
        );

        const organizationVersion = targetProject.owner.version;

        // Using the correct team ID from the working example
        console.log('🔍 Step 6.4: Using team ID from working example...');

        const teamId = targetProject.owner.teams.find(
          (team) => team.name === teamName
        )?.id;

        if (!teamId) {
          throw new Error(
            `Team with name "${teamName}" not found in user projects`
          );
        }

        console.log(
          `✅ Found organization: ${organizationId}, version: ${organizationVersion}, team: ${teamId}`
        );

        // Step 3: Validate email (re-enabling this step as per API documentation)
        console.log('📧 Step 6.5: Validating email for invitation...');

        const validationResult = await validateEmail({
          variables: {
            email,
            organizationId,
            teamId,
          },
        });

        if (!validationResult.data?.invitation?.hasValidEmail) {
          console.log(
            '⚠️ Email validation failed, but proceeding with invitation...'
          );
        } else {
          console.log('✅ Email validation successful');
        }

        // Step 4: Send invitation
        console.log('📨 Step 6.6: Sending Merchant Center invitation...');

        const invitationDraft: InvitationDraft = {
          emails: [email],
          organization: {
            id: organizationId,
            version: organizationVersion,
          },
          team: {
            id: teamId,
          },
        };

        console.log('🔍 Step 6.7: Sending Merchant Center invitation...');
        console.log(invitationDraft);

        const invitationResult = await sendInvitation({
          variables: {
            draft: invitationDraft,
          },
        });

        if (invitationResult.data?.invite?.status) {
          console.log(
            `✅ Merchant Center invitation sent successfully to ${email}`
          );
          return true;
        } else {
          throw new Error('Invitation failed - no status returned');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        console.warn(`⚠️ Merchant Center invitation failed: ${errorMessage}`);
        setError(err as ApolloError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      currentProjectKey,
      teamName,
      getUserProjects,
      validateEmail,
      sendInvitation,
    ]
  );

  return {
    loading,
    error,
    inviteSellerToMerchantCenter,
  };
};

export default useMerchantCenterManagement;

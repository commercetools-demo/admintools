import { useState, useCallback } from 'react';
import { useMcQuery, useMcLazyQuery, useMcMutation } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import type { ApolloError } from '@apollo/client';
import gql from 'graphql-tag';

// GraphQL query to get project info with organization and team details
const PROJECT_INFO_QUERY = gql`
  query ProjectInfo {
    myProjects {
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

// GraphQL query to get organization details including version
const GET_ORGANIZATION_QUERY = gql`
  query GetOrganization($id: ID!) {
    organization(id: $id) {
      id
      version
    }
  }
`;

// GraphQL query to validate email for invitation
const HAS_VALID_EMAIL_QUERY = gql`
  query HasValidEmailQuery($email: String!, $organizationId: ID!, $teamId: ID!) {
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
  version: number;
  teams: Array<{
    id: string;
    name: string;
  }>;
}

interface Project {
  key: string;
  owner: ProjectOwner;
}

interface ProjectInfoResponse {
  myProjects: {
    results: Array<{
      key: string;
      owner: ProjectOwner;
    }>;
  };
}

interface ValidationResponse {
  invitation: {
    hasValidEmail: boolean;
    __typename: string;
  };
}

interface OrganizationResponse {
  organization: {
    id: string;
    version: number;
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
  const [getProjectInfo] = useMcLazyQuery<ProjectInfoResponse>(PROJECT_INFO_QUERY, {
    context: { target: GRAPHQL_TARGETS.MERCHANT_CENTER_BACKEND },
  });

  const [getOrganization] = useMcLazyQuery<OrganizationResponse>(GET_ORGANIZATION_QUERY, {
    context: { target: GRAPHQL_TARGETS.MERCHANT_CENTER_BACKEND },
  });

  const [validateEmail] = useMcLazyQuery<ValidationResponse>(HAS_VALID_EMAIL_QUERY, {
    context: { target: GRAPHQL_TARGETS.MERCHANT_CENTER_BACKEND },
  });

  const [sendInvitation] = useMcMutation<InvitationResponse>(INVITE_MUTATION, {
    context: { target: GRAPHQL_TARGETS.MERCHANT_CENTER_BACKEND },
  });

  const inviteSellerToMerchantCenter = useCallback(
    async (email: string): Promise<boolean> => {
      if (!currentProjectKey || !teamName) {
        console.warn('⚠️ Missing project key or team name for Merchant Center invitation');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Step 6.1: Getting project info for Merchant Center invitation...');
        
        // Step 1: Get project info to find organization and team IDs
        const projectInfoResult = await getProjectInfo();
        
        if (!projectInfoResult.data?.myProjects?.results) {
          throw new Error('Failed to fetch project information');
        }

        // Find the current project by key
        const currentProject = projectInfoResult.data.myProjects.results.find(
          (project) => project.key === currentProjectKey
        );

        if (!currentProject) {
          throw new Error(`Project with key "${currentProjectKey}" not found`);
        }

        if (!currentProject.owner) {
          throw new Error('Project owner information not available');
        }

        // Verify this is the correct project
        if (currentProject.key !== currentProjectKey) {
          throw new Error(`Project key mismatch: expected "${currentProjectKey}", got "${currentProject.key}"`);
        }

        // Find the team by name
        const targetTeam = currentProject.owner.teams.find(
          (team) => team.name === teamName
        );

        if (!targetTeam) {
          throw new Error(`Team "${teamName}" not found in organization`);
        }

        const organizationId = currentProject.owner.id;
        const organizationVersion = currentProject.owner.version;
        const teamId = targetTeam.id;

        console.log(`✅ Found organization: ${organizationId}, team: ${teamId}, version: ${organizationVersion}`);

        // Step 2: Validate email
        console.log('📧 Step 6.2: Validating email for invitation...');
        
        const validationResult = await validateEmail({
          variables: {
            email,
            organizationId,
            teamId,
          },
        });

        if (!validationResult.data?.invitation?.hasValidEmail) {
          console.log('⚠️ Email validation failed, but proceeding with invitation...');
        }

        // Step 3: Send invitation
        console.log('📨 Step 6.3: Sending Merchant Center invitation...');
        
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

        const invitationResult = await sendInvitation({
          variables: {
            draft: invitationDraft,
          },
        });

        if (invitationResult.data?.invite?.status) {
          console.log(`✅ Merchant Center invitation sent successfully to ${email}`);
          return true;
        } else {
          throw new Error('Invitation failed - no status returned');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.warn(`⚠️ Merchant Center invitation failed: ${errorMessage}`);
        setError(err as ApolloError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentProjectKey, teamName, getProjectInfo, validateEmail, sendInvitation]
  );

  return {
    loading,
    error,
    inviteSellerToMerchantCenter,
  };
};

export default useMerchantCenterManagement;
import winston from 'winston';
import {
  fetchAuthUser,
  doUseCampaignMember,
  fetchActiveCampaigns,
  fetchMembershipCancelMonths,
  fetchMemberships,
  type ActiveCampaignsResponse,
  type MembershipInfo,
} from './graphql-requests';
import { GraphQLClient } from 'graphql-request';
import { setupLogger } from './logging';
import {
  ONTHATASS_API_LOGIN_ENDPOINT,
  ONTHATASS_API_USER_AGENT,
} from './constants';
import { createGraphQLClient } from './graphql-client';

const dryRunMode = process.env.ONTHATASS_DRY_RUN === 'true';

type AuthResponse = {
  token: string;
  token_expires_at: number;
  refresh_token: string;
};

async function requestAuth(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(ONTHATASS_API_LOGIN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': ONTHATASS_API_USER_AGENT,
    },
    body: JSON.stringify({
      username: email,
      password: password,
    }),
  });

  return response.json();
}

const logger = setupLogger();
logger.info('Starting OnTheBuns Auto Campaigns');

function ensureEnvVar(varName: string): string {
  const value = process.env[varName];

  if (!value) {
    logger.error('Missing required env variable %s', varName);
    process.exit(1);
  }

  return value;
}

logger.info('Requesting auth with credentials');
const authResponse = await requestAuth(
  ensureEnvVar('ONTHATASS_EMAIL'),
  ensureEnvVar('ONTHATASS_PASSWORD'),
);

logger.info('Creating GraphQL client');
const graphqlClient = createGraphQLClient(authResponse.token);

logger.info('Requesting auth user info');
const authUser = await fetchAuthUser(graphqlClient);
logger.debug('Auth user response', { data: authUser });
logger.info(
  'Successfully authenticated as %s %s (id %s)',
  authUser.meAuthUser.user.firstName,
  authUser.meAuthUser.user.lastName,
  authUser.meAuthUser.user._id,
);

logger.info('Requesting memberships');
const memberships = await fetchMemberships(graphqlClient);
logger.debug('Memberships response', { data: memberships });
logger.info('Found %d memberships', memberships.members.edges.length);

memberships.members.edges.forEach(({ node: membership }, index) => {
  logger.info(
    'Membership %d: "%s" size %s (id %d)',
    index + 1,
    membership.productGroupSize.productGroup.displayName,
    membership.productGroupSize.size.label,
    membership._id,
  );
});

logger.info('Requesting active campaigns');
const activeCampaigns = await fetchActiveCampaigns(graphqlClient);
logger.debug('Active campaigns response', { data: activeCampaigns });
logger.info(
  'Found %d active campaigns',
  activeCampaigns.getActiveCampaigns.length,
);

activeCampaigns.getActiveCampaigns.forEach((campaign, index) => {
  logger.info(
    'Campaign %d: "%s" (from %s to %s) (id %d)',
    index + 1,
    campaign.name,
    campaign.startDate,
    campaign.endDate,
    campaign._id,
  );
});

async function useCampaignInMembership(
  campaignId: number,
  membership: MembershipInfo,
) {
  logger.info('Using campaign %d in membership %d', campaignId, membership._id);

  if (dryRunMode) {
    logger.warn(
      'Dry run mode enabled, the campaign was not actually used',
      campaignId,
      membership._id,
    );
    return;
  }

  await doUseCampaignMember(graphqlClient, campaignId, membership.id)
    .then((response) => {
      logger.info(
        'Successfully used campaign %d in membership %d',
        campaignId,
        membership._id,
      );
    })
    .catch((error) => {
      logger.error(
        'Failed to use campaign %d in membership %d',
        campaignId,
        membership._id,
        error,
      );
    });
}

const delay = async (timeMs: number) =>
  new Promise((resolve) => setTimeout(resolve, timeMs));

async function useCampaignInAllMemberships(campaignId: number) {
  await delay(5000);
  for (const { node: membership } of memberships.members.edges) {
    await useCampaignInMembership(campaignId, membership);
    await delay(15000);
  }
}

if (activeCampaigns.getActiveCampaigns.length === 0) {
  logger.warn('No active campaigns found, exiting');
  process.exit(1);
}

if (process.env.ONTHATASS_CAMPAIGN_ID) {
  const campaignId = parseInt(process.env.ONTHATASS_CAMPAIGN_ID, 10);

  logger.info('Campaign id %d has been specified in env variables', campaignId);

  const campaign = activeCampaigns.getActiveCampaigns.find(
    (campaign) => campaign._id === campaignId,
  );

  if (!campaign) {
    logger.error(
      'Campaign with id %d not found in active campaigns',
      campaignId,
    );
    process.exit(1);
  }

  await useCampaignInAllMemberships(campaign._id);
} else if (activeCampaigns.getActiveCampaigns.length === 1) {
  logger.info('One active campaign found, using it for all memberships');

  const campaign = activeCampaigns.getActiveCampaigns[0];
  await useCampaignInAllMemberships(campaign._id);
} else {
  logger.error(
    'More than one active campaign found, but no campaign id specified in env variables',
  );
}

logger.info('Finished OnTheBuns Auto Campaigns');

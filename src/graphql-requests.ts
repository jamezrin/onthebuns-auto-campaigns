import {
  activeCampaignsQuery,
  authUserQuery,
  cancelMonthsQuery,
  membershipsQuery,
  useCampaignMemberMutation,
} from './graphql-templates';

import { GraphQLClient } from 'graphql-request';

type WrappedResponse<QueryKey extends string, ResponseType> = {
  [key in QueryKey]: ResponseType;
};

export type AuthUserResponse = {
  _id: number;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
  dateOfBirth: string;
  avatar: string;
  user: {
    _id: number;
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    status: number;
    dobDate: string;
    billingAddress: any;
    addresses: any;
    country: any;
    orderBundles: any;
    paymentContracts: any;
  };
};

export async function fetchAuthUser<
  Type = WrappedResponse<'meAuthUser', AuthUserResponse>,
>(graphqlClient: GraphQLClient) {
  return await graphqlClient.request<Type>(authUserQuery);
}

export type MembershipsResponse = {
  pageInfo: {
    startCursor: string;
    endCursor: string;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  edges: {
    node: {
      _id: number;
      id: string;
      firstName: string;
      lastName: string;
      fullName: string;
      email: string;
      phoneNumber: string;
      dobDate: string;
      status: 1;
      pauseDate: string;
      unPauseDate: string;
      terminationDate: string;
      subscriptionDate: string;
      country: {
        _id: number;
        id: string;
        name: string;
        hostNamePrefix: string;
      };
      productGroupSize: {
        _id: number;
        id: string;
        size: {
          _id: number;
          id: string;
          label: string;
        };
        productGroup: {
          _id: number;
          id: string;
          category: number;
          name: string;
          displayName: string;
          slug: string;
        };
      };
    };
  }[];
};

export type MembershipInfo = MembershipsResponse['edges'][0]['node'];

export async function fetchMemberships<
  Type = WrappedResponse<'members', MembershipsResponse>,
>(graphqlClient: GraphQLClient, includeAddress?: boolean, first?: number) {
  return await graphqlClient.request<Type>(membershipsQuery, {
    includeAddress,
    first,
  });
}

export type ActiveCampaignsResponse = {
  id: string;
  _id: number;
  name: string;
  startDate: string;
  endDate: string;
  contents: {
    [locale: string]: {
      title: string;
      description: string;
    };
  };
  memberIds: number[];
  type: number;
}[];

export async function fetchActiveCampaigns<
  Type = WrappedResponse<'getActiveCampaigns', ActiveCampaignsResponse>,
>(graphqlClient: GraphQLClient) {
  return await graphqlClient.request<Type>(activeCampaignsQuery);
}

export type MembershipCancelMonthsResponse = {
  memberId: number;
  data: {
    label: number;
    label_extra: string;
    value: string;
  }[];
};

export async function fetchMembershipCancelMonths<
  Type = WrappedResponse<'getCancelMonths', MembershipCancelMonthsResponse>,
>(graphqlClient: GraphQLClient, membershipId: number) {
  return await graphqlClient.request<Type>(cancelMonthsQuery, {
    memberId: membershipId,
  });
}

export type UseCampaignMemberResponse = {
  member: {
    campaignStay: number;
  };
};

export async function doUseCampaignMember<
  Type = WrappedResponse<'useCampaignMember', UseCampaignMemberResponse>,
>(graphqlClient: GraphQLClient, campaignId: number, membershipPath: string) {
  return await graphqlClient.request<Type>(useCampaignMemberMutation, {
    id: membershipPath,
    campaignId,
  });
}

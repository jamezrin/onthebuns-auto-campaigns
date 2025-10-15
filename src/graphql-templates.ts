import { gql } from 'graphql-request';

export const authUserQuery = gql`
  query GetAuthUser {
    meAuthUser {
      _id
      id
      fullName
      firstName
      lastName
      email
      createdAt
      updatedAt
      dateOfBirth
      avatar
      user {
        _id
        id
        firstName
        lastName
        email
        phoneNumber
        status
        paymentContracts {
          edges {
            node {
              status
              active
              __typename
            }
            __typename
          }
          __typename
        }
        orderBundles {
          edges {
            node {
              orders {
                edges {
                  node {
                    shipment {
                      status
                      __typename
                    }
                    __typename
                  }
                  __typename
                }
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        country {
          _id
          id
          name
          canCancelSubscriptionAfterDays
          expectedDeliveryDateDailyOrderAfterDays
          canDoReturnRequestAfterDay
          __typename
        }
        addresses {
          edges {
            node {
              _id
              id
              street
              fullStreet
              streetType
              houseNumber
              annex
              building
              city
              postalCode
              country {
                _id
                id
                name
                hostNamePrefix
                languages {
                  edges {
                    node {
                      id
                      iso
                      __typename
                    }
                    __typename
                  }
                  __typename
                }
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        billingAddress {
          _id
          id
          street
          fullStreet
          streetType
          houseNumber
          annex
          building
          city
          postalCode
          country {
            _id
            id
            name
            hostNamePrefix
            __typename
          }
          __typename
        }
        dobDate
        __typename
      }
      __typename
    }
  }
`;

export const membershipsQuery = gql`
  query Members($includeAddress: Boolean = false, $first: Int = 30) {
    members(first: $first, order: { createdAt: "ASC" }) {
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
        __typename
      }
      edges {
        node {
          _id
          id
          firstName
          lastName
          fullName
          email
          phoneNumber
          dobDate
          status
          pauseDate
          unPauseDate
          terminationDate
          subscriptionDate
          country {
            _id
            id
            name
            hostNamePrefix
            __typename
          }
          productGroupSizes {
            edges {
              node {
                _id
                id
                size {
                  _id
                  id
                  label
                  __typename
                }
                productGroup {
                  _id
                  id
                  category
                  name
                  displayName
                  slug
                  __typename
                }
                __typename
              }
              __typename
            }
            __typename
          }
          postalAddress @include(if: $includeAddress) {
            _id
            id
            street
            houseNumber
            annex
            postalCode
            city
            building
            floor
            streetType
            region
            fullStreet
            country {
              _id
              id
              name
              hostNamePrefix
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

export const activeCampaignsQuery = gql`
  query getActiveCampaigns {
    getActiveCampaigns {
      id
      _id
      name
      startDate
      endDate
      contents
      memberIds
      type
      __typename
    }
  }
`;

export const cancelMonthsQuery = gql`
  query getCancelMonths($memberId: Int!) {
    getCancelMonths(memberId: $memberId) {
      memberId
      data
      __typename
    }
  }
`;

export const useCampaignMemberMutation = gql`
  mutation Member($id: ID!, $campaignId: Int!) {
    useCampaignMember(input: { id: $id, campaignId: $campaignId }) {
      member {
        _id
        id
        __typename
      }
      __typename
    }
  }
`;

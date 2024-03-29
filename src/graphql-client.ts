import { GraphQLClient } from 'graphql-request';
import {
  ONTHATASS_API_GRAPHQL_ENDPOINT,
  ONTHATASS_API_USER_AGENT,
} from './constants';

export function createGraphQLClient(token: string) {
  return new GraphQLClient(ONTHATASS_API_GRAPHQL_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${token}`,
      Host: 'onthatass.com',
      Origin: 'https://onthatass.com',
      'sec-ch-ua':
        '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': 'Windows',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'User-Agent': ONTHATASS_API_USER_AGENT,
    },
  });
}

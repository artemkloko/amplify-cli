import { GraphQLObjectType, GraphQLSchema } from 'graphql';

import { collectExternalFragments, generateMutations, generateQueries, generateSubscriptions } from './generateAllOperations';
import { GQLDocsGenOptions, GQLAllOperations } from './types';

export default function generate(schemaDoc: GraphQLSchema, maxDepth: number, options: GQLDocsGenOptions): GQLAllOperations {
  try {
    const queryTypes: GraphQLObjectType = schemaDoc.getQueryType();
    const mutationType: GraphQLObjectType = schemaDoc.getMutationType();
    const subscriptionType: GraphQLObjectType = schemaDoc.getSubscriptionType();
    const queries = generateQueries(queryTypes, schemaDoc, maxDepth, options);
    const mutations = generateMutations(mutationType, schemaDoc, maxDepth, options);
    const subscriptions = generateSubscriptions(subscriptionType, schemaDoc, maxDepth, options);
    const fragments = collectExternalFragments([...queries.operations, ...mutations.operations, ...subscriptions.operations]);
    return { queries, mutations, subscriptions, fragments };
  } catch (e) {
    throw new Error('GraphQL schema file should contain a valid GraphQL introspection query result');
  }
}

import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { pascalCase } from 'change-case';

import generateOperation from './generateOperation';
import { GQLTemplateOp, GQLOperationTypeEnum, GQLTemplateField, GQLDocsGenOptions, GQLOrderedFragments, GQLTypeOperations } from './types';

export function generateQueries(
  queries: GraphQLObjectType,
  schema: GraphQLSchema,
  maxDepth: number,
  options: GQLDocsGenOptions,
): GQLTypeOperations {
  if (queries) {
    const allQueries = queries.getFields();
    const processedQueries: GQLTemplateOp[] = Object.keys(allQueries).map(queryName => {
      const type: GQLOperationTypeEnum = GQLOperationTypeEnum.QUERY;
      const op = generateOperation(allQueries[queryName], schema, maxDepth, options);
      const name: string = pascalCase(queryName);
      return { type, name, ...op };
    });
    // collect refFragments from all operations for `import` statements
    const refFragments = collectRefFragments(processedQueries.map(op => op.body));
    return { operations: processedQueries, refFragments };
  }
}

export function generateMutations(
  mutations: GraphQLObjectType,
  schema: GraphQLSchema,
  maxDepth: number,
  options: GQLDocsGenOptions,
): GQLTypeOperations {
  if (mutations) {
    const allMutations = mutations.getFields();
    const processedMutations = Object.keys(allMutations).map(mutationName => {
      const type: GQLOperationTypeEnum = GQLOperationTypeEnum.MUTATION;
      const op = generateOperation(allMutations[mutationName], schema, maxDepth, options);
      const name = pascalCase(mutationName);
      return { type, name, ...op };
    });
    // collect refFragments from all operations for `import` statements
    const refFragments = collectRefFragments(processedMutations.map(op => op.body));
    return { operations: processedMutations, refFragments };
  }
}

export function generateSubscriptions(
  subscriptions: GraphQLObjectType,
  schema: GraphQLSchema,
  maxDepth: number,
  options: GQLDocsGenOptions,
): GQLTypeOperations {
  if (subscriptions) {
    const allSubscriptions = subscriptions.getFields();
    const processedSubscriptions = Object.keys(allSubscriptions).map(subscriptionName => {
      const type: GQLOperationTypeEnum = GQLOperationTypeEnum.SUBSCRIPTION;
      const op = generateOperation(allSubscriptions[subscriptionName], schema, maxDepth, options);
      const name = pascalCase(subscriptionName);
      return { type, name, ...op };
    });
    // collect refFragments from all operations for `import` statements
    const refFragments = collectRefFragments(processedSubscriptions.map(op => op.body));
    return { operations: processedSubscriptions, refFragments };
  }
}

export function collectExternalFragments(operations: GQLTemplateOp[] = []) {
  const fragments: GQLOrderedFragments = { order: [], entries: {} };
  operations.forEach(op => {
    getExternalFragment(op.body, fragments, true);
  });
  return fragments.order.map(fragmentName => fragments.entries[fragmentName]);
}

export function collectRefFragments(fields: GQLTemplateField[] = []) {
  const fragments: GQLOrderedFragments = { order: [], entries: {} };
  fields.forEach(field => {
    getExternalFragment(field, fragments, false);
  });
  return fragments.order.map(fragmentName => fragments.entries[fragmentName]);
}

function getExternalFragment(field: GQLTemplateField, externalFragments: GQLOrderedFragments, includeSubFragments: boolean = true) {
  field.fragments
    .filter(fragment => fragment.external)
    .reduce((acc, val) => {
      const index = acc.order.indexOf(val.name);
      if (index === -1) {
        acc.order.unshift(val.name);
      } else if (index > 0) {
        acc.order.splice(index, 1);
        acc.order.unshift(val.name);
      }
      acc.entries[val.name] = val;
      return acc;
    }, externalFragments);
  field.fields.forEach(f => {
    getExternalFragment(f, externalFragments, includeSubFragments);
  });
  if (includeSubFragments) {
    field.fragments.forEach(fragment =>
      fragment.fields.forEach(f => {
        getExternalFragment(f, externalFragments, includeSubFragments);
      }),
    );
  }

  return externalFragments;
}

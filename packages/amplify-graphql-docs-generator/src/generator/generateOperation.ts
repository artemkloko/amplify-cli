import { GraphQLField, GraphQLSchema } from 'graphql';

import getArgs from './getArgs';
import getBody from './getBody';
import { collectRefFragments } from './generateAllOperations';
import { GQLTemplateGenericOp, GQLTemplateArgDeclaration, GQLTemplateOpBody, GQLDocsGenOptions, GQLOrderedFragments } from './types';

export default function generateOperation(
  operation: GraphQLField<any, any>,
  schema: GraphQLSchema,
  maxDepth: number = 3,
  options: GQLDocsGenOptions,
): GQLTemplateGenericOp {
  const args: Array<GQLTemplateArgDeclaration> = getArgs(operation.args);
  const body: GQLTemplateOpBody = getBody(operation, schema, maxDepth, options);
  // collect refFragments from return fields of this operation for fragment variable references
  const refFragments = collectRefFragments([body]);
  return {
    args,
    body,
    refFragments,
  };
}

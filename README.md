<a href="https://aws-amplify.github.io/" target="_blank">
    <img src="https://s3.amazonaws.com/aws-mobile-hub-images/aws-amplify-logo.png" alt="AWS Amplify" width="550" >
</a>

---

# AWS Amplify `@fragment`

This repo contains a fork of `@aws-amplify/cli` with a hacky implementation of `@fragment` directive. This directive can be used in a `schema.graphql` of an amplify backend api in order to generate GraphQL fragments.

Based on `@aws-amplify/cli@4.32.1`

This implementation supports **only TypeScript**.

**Not recommened at all for production**, although I personally use it in production.

---

## Setup

```bash
git clone https://github.com/artemkloko/@aws-amplify/cli
cd amplify-cli
yarn setup-dev
```

Add the following to `__YOUR_AMPLIFY_PROJECT_ROOT_DIR__/amplify/backend/api/__API_NAME__/transform.conf.json`

```json
{
    ...
    "transformers": [
        "graphql-fragment-transformer"
    ]
}
```

---

## Usage

In the user-editable-schema of an amplify project add `@fragment` directive to any Object that you want to have as a fragment in the generated operations/types.

```graphql
type User @model @fragment {
  id: ID!
  name: String!
  language: Language!
  location: Location!
}

type Language {
  name: String!
  location: Location!
}

type Location @fragment {
  lat: Float!
  lon: Float!
}
```

On the command line use `amplify-dev` istread of `amplify`.

```bash
amplify-dev push api
amplify-dev codegen
```

If while running `amplify-dev`, it complains that `graphql-fragment-transformer` can not be found, do the following:

```bash
cd amplify-cli
yarn global add graphql-fragment-transformer@link:${PWD}/packages/graphql-fragment-transformer
```

---

## About this strategy

### New packages

#### `graphql-fragment-transformer`

A transformer package that does absolutely nothing apart from making the `@fragment` directive accepable by `@aws-amplify/cli` packages that do not have a hardcoded set of acceptable directives.

- [packages/graphql-fragment-transformer/src/index.ts](https://github.com/artemkloko/amplify-cli/blob/4ddd5c86daf25145f39e72cf4947947aa79ec47a/packages/graphql-fragment-transformer/src/index.ts#L14)

### Modified packages

#### `graphql-transformer-core`

`@fragment` directive has been added to "acceptable directives". `graphql-transformer-core` has a hardcoded set of directives that are not stripped down when the user-editable-schema is transformed to final-build-schema. This modification allows the `@fragment` directive to not be stripped down and remain in the final-build-schema.

- [packages/graphql-transformer-core/src/TransformFormatter.ts](https://github.com/artemkloko/amplify-cli/blob/35689b2b629c506f203ec105de03fe0e82bb459a/packages/graphql-transformer-core/src/TransformFormatter.ts#L99)

#### `amplify-graphql-types-generator`

`@fragment` directive has been added to "acceptable directives". `amplify-graphql-types-generator` has a hardcoded set of directives that are acceptable to be found in the final-build-schema when generating the types.

- [packages/amplify-graphql-types-generator/awsAppSyncDirectives.graphql](https://github.com/artemkloko/amplify-cli/blob/6cf4fbed90cb5204bf599b721bac555945a63846/packages/amplify-graphql-types-generator/awsAppSyncDirectives.graphql#L24)

#### `amplify-graphql-docs-generator`

`@fragment` directive has been added to "acceptable directives". `amplify-graphql-docs-generator` has a hardcoded set of directives that are acceptable to be found in the final-build-schema when generating the types.

- [packages/amplify-graphql-docs-generator/awsAppSyncDirectives.graphql](https://github.com/artemkloko/amplify-cli/blob/00984647f67e1ef25779b07353949eee8fc80c22/packages/amplify-graphql-docs-generator/awsAppSyncDirectives.graphql#L24)

The code has been modified to check for `@fragment` directive and render a field as external fragment in such cases.

- [packages/amplify-graphql-docs-generator/src/generator/getFields.ts](https://github.com/artemkloko/amplify-cli/blob/f60277a7bbffca6d4ee079fc9d7541666747e5f2/packages/amplify-graphql-docs-generator/src/generator/getFields.ts#L27)
- [packages/amplify-graphql-docs-generator/src/generator/getFields.ts](https://github.com/artemkloko/amplify-cli/blob/f60277a7bbffca6d4ee079fc9d7541666747e5f2/packages/amplify-graphql-docs-generator/src/generator/getFields.ts#L57)

The code and internal types have been modified to generate `refFragments` which allows us to specify fragments by inclusion of a variable that contains the fragment definition.

- [packages/amplify-graphql-docs-generator/src/generator/getFragment.ts](https://github.com/artemkloko/amplify-cli/blob/f60277a7bbffca6d4ee079fc9d7541666747e5f2/packages/amplify-graphql-docs-generator/src/generator/getFragment.ts#L22)
- [packages/amplify-graphql-docs-generator/src/generator/generateOperation.ts](https://github.com/artemkloko/amplify-cli/blob/f60277a7bbffca6d4ee079fc9d7541666747e5f2/packages/amplify-graphql-docs-generator/src/generator/generateOperation.ts#L17)
- [packages/amplify-graphql-docs-generator/src/generator/generateAllOperations.ts](https://github.com/artemkloko/amplify-cli/blob/f60277a7bbffca6d4ee079fc9d7541666747e5f2/packages/amplify-graphql-docs-generator/src/generator/generateAllOperations.ts#L83)

Also the rendering templates have been modified to accompany the previously mentioned changes.

- [packages/amplify-graphql-docs-generator/templates/\_renderToVariable.hbs](https://github.com/artemkloko/amplify-cli/blob/f60277a7bbffca6d4ee079fc9d7541666747e5f2/packages/amplify-graphql-docs-generator/templates/_renderToVariable.hbs#L1)
- [packages/amplify-graphql-docs-generator/templates/\_renderRefFragments.hbs](https://github.com/artemkloko/amplify-cli/blob/f60277a7bbffca6d4ee079fc9d7541666747e5f2/packages/amplify-graphql-docs-generator/templates/_renderRefFragments.hbs#L1)

### Tests

No tests have been implemented. If this stategy will be considered a viable solution - I will implement the tests.

### Further to do's

If this stategy will be considered a viable solution the following items should be implemented:

- [ ] Implement tests
- [ ] Make `amplify-graphql-types-generator` use fragments' types instread of spreading fields
- [ ] Support languages other than TypeScript

---

## Other strategies

#### Union/Interface

Plan:

- user puts @fragment on objects in the user-editable schema.graphql
- transformer creates a union/interface for each @fragment directive
- transformer replaces types' fields that refer to this definition with the union/interface
- transformer replaces operations' return values that refer to this definition with the union/interface
- hacked amplify-graphql-docs-generator treats union/interface as external fragments

Cons:

- final build schema.graphql is altered and extraneous types are added
- hacked amplify-graphql-docs-generator

Why not:

- graphql-auth-transformer tries to protect auto-generated operations
  - https://github.com/aws-amplify/amplify-cli/blob/b85a88221e300ed79ce613fa1e9735ea416db6af/packages/graphql-auth-transformer/src/ModelAuthTransformer.ts#L380
- while doing so it grabs the return value of an auto-generated operation by using addObjectExtension
  - https://github.com/aws-amplify/amplify-cli/blob/b85a88221e300ed79ce613fa1e9735ea416db6af/packages/graphql-auth-transformer/src/ModelAuthTransformer.ts#L1989
- which can only grab objectType from root and not union/interface
  - https://github.com/aws-amplify/amplify-cli/blob/b85a88221e300ed79ce613fa1e9735ea416db6af/packages/graphql-transformer-core/src/TransformerContext.ts#L485

#### Fragments for all

Plan:

- hacked amplify-graphql-docs-generator generates external fragments for all available root object types

Cons:

- no control over which types we want fragments for
- hacked amplify-graphql-docs-generator

#### Store fragments in a union

Plan:

- user creates a union called fragments (ie `union Fragments = Message | User | Location`)
- hacked amplify-graphql-docs-generator uses that union to generate external fragments

Cons:

- not a standard way of doing things in amplify/graphql
- extraneous union type
- hacked amplify-graphql-docs-generator

import { gql, Transformer } from 'graphql-transformer-core';

export async function executeAmplifyCommand() {}

export async function handleAmplifyEvent() {}

class FragmentTransformer extends Transformer {
  constructor() {
    // TODO remove once prettier is upgraded
    // prettier-ignore
    super(
      'FragmentTransformer',
      gql`
        directive @fragment on OBJECT
      `
    );
  }

  object = () => {};
}

export default FragmentTransformer;

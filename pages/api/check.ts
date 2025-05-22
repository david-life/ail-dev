// /workspaces/ail-offline/pages/api/check.ts
import * as transformers from '@xenova/transformers';

export default async function handler(req, res) {
  const details = {
    availableExports: Object.keys(transformers),
    pipelineTypes: Object.getOwnPropertyNames(transformers).filter(name => 
      name.includes('Pipeline') || name.includes('pipeline')
    )
  };
  
  res.status(200).json(details);
}

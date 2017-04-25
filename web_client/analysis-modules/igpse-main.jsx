import { IGPSEWorkflow } from './igpse-lib';

const main = () => (
  (new IGPSEWorkflow()).runWorkflowStep('input')()
);

export default main;

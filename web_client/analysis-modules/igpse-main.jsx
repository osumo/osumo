import { IGPSEWorkflow } from './igpse-lib';

const main = () => {
  let igpse = new IGPSEWorkflow();
  return igpse.setBusy(false)
    .then(igpse.runWorkflowStep('input'));
};

export default main;

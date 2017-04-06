
import igpse from './igpse';
import kmeans from './kmeans';
import silhouette from './silhouette';
import surv from './surv';
import featureMatching from './feature-matching';

/* eslint-disable */
export default [
  { key: 'igpse'     , name: 'iGPSe'           , module: igpse           },
  { key: 'kmeans'    , name: 'K Means'         , module: kmeans          },
  { key: 'silhouette', name: 'Silhouette Plot' , module: silhouette      },
  { key: 'surv'      , name: 'Survival Plot'   , module: surv            },
  { key: 'fmatch'    , name: 'Feature Matching', module: featureMatching }
];
/* eslint-enable */


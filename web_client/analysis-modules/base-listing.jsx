
import igpse from './igpse';
import kmeans from './kmeans';
import silhouette from './silhouette';
import surv from './surv';

export default [
  { key: 'igpse'     , name: 'iGPSe'          , module: igpse      },
  { key: 'kmeans'    , name: 'K Means'        , module: kmeans     },
  { key: 'silhouette', name: 'Silhouette Plot', module: silhouette },
  { key: 'surv'      , name: 'Survival Plot'  , module: surv       }
];


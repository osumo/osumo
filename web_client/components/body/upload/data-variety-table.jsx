import React from 'react';

export const table = [
  { id: 'proteinX'    , description: 'Protein Expression'                   },
  { id: 'rawSequence' , description: 'Raw Sequencing Data'                  },
  { id: 'cprofile'    , description: 'Clinical Profile'                     },
  { id: 'dnaMeth'     , description: 'DNA Methylation'                      },
  { id: 'mrna'        , description: 'Gene Expression Quantification'       },
  { id: 'mirna'       , description: 'MicroRNA Quantification'              },
  { id: 'isoX'        , description: 'Isoform Expression Quantification'    },
  { id: 'exonJunction', description: 'Exon Junction Quantification'         },
  { id: 'exon'        , description: 'Exon Quantification'                  },
  { id: 'mrnaSummary' , description: 'Gene Expression Summary'              },
  { id: 'som'         , description: 'Somatic Mutation'                     },
  { id: 'img'         , description: 'Imaging and morphological parameters' },

  /* should always have a none option */
  { id: 'none'        , description: ' - none/other - '                      }
];

export const elements = table.map(
  ({ id, description }) => (
    <option key={id} value={id}>{description}</option>
  )
);

export default table;

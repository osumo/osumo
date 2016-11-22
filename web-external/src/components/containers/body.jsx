import React from 'react';
import { connect } from 'react-redux';
import Body from '../body';
import FrontPage from '../body/front-page';
import ProcessData from '../body/process-data';
import ProcessPage from '../body/process-page';

const BodyContainer = connect(
  ({ globalNavTarget: filterKey }) => ({ backupKey: '', filterKey }),

  () => ({
    children: [
      <FrontPage groupKey='' key=''/>,
      <ProcessData groupKey='process' key='process'/>,
      <ProcessPage groupKey='testing' key='testing'
        name='iGPSe'
        description='Interactive Genomics Patient Stratification explorer'
        notes='Show a survival plot based on clustering of different data sets.'
        ui={[
          {
            key: 'mrna_input_path',
            name: 'Gene Expression Profile',
            description: 'mRNA data',
            notes: (
              'This must be a CSV file with one column per subject, one ' +
              'header row, and one data row per gene.'
            ),
            type: 'file_selection',
            options: { onlyNames: '^mRNA.*csv$' }
          },

          {
            key: 'mrna_clusters',
            name: 'mRNA Number of Clusters (k)',
            description: 'The number (k) of clusters used in calculations',
            notes: 'Clustering is performed via k-means.',
            type: 'field',
            options: {
              data_type: 'integer',
              default: 5
            }
          },

          {
            key: 'mirna_input_path',
            name: 'MicroRNA Expression Profile',
            description: 'miRNA data',
            notes: (
              'This must be a CSV file with one column per subject, one ' +
              'header row, and one data row per micro RNA.'
            ),
            type: 'file_selection',
            options: { onlyNames: '^miRNA.*csv$' }
          },

          {
            key: 'mirna_clusters',
            name: 'miRNA Number of Clusters (k)',
            description: 'The number (k) of clusters used in calculations',
            notes: 'Clustering is performed via k-means.',
            type: 'field',
            options: {
              data_type: 'integer',
              default: 5
            }
          },

          {
            key: 'clinical_input_path',
            name: 'Clinical Profile',
            notes: (
              'This must be a CSV file with a header row and one row per ' +
              'subject, and columns containing the row description, survival ' +
              'duration, and an indicator field.'
            ),
            type: 'file_selection',
            options: { onlyNames: '^time.*csv$' }
          },

          {
            key: 'output_dir',
            name: 'Output Location',
            description: 'output data folder',
            notes: (
              'Location where the mRNA heatmap, miRNA heatmap, and cluster ' +
              'data is stored.'
            ),
            type: 'folder_selection'
          },

          {
            type: 'button',
            name: 'Process',
            action: 'process'
          }
        ]}/>
    ]
  })
)(Body);

export default BodyContainer;

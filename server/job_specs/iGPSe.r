require(jsonlite)
require(pheatmap)
# require(factoextra)
require(survival)


mRNA.m <- read.csv(mrna_input_path)
output_mrna_dim = dim(mRNA.m)

miRNA.m <- read.csv(mirna_input_path)
output_mirna_dim = dim(miRNA.m)

clinical.m <- read.csv(clinical_input_path)
output_clinical_dim = dim(clinical.m)

mRNACluster.cl <- kmeans(t(mRNA.m), centers = mrna_clusters)
mRNACluster.b <- as.numeric(mRNACluster.cl$cluster)
miRNACluster.cl <- kmeans(t(miRNA.m), centers = mirna_clusters)
miRNACluster.b <- as.numeric(miRNACluster.cl$cluster)

# generate heatplot
render_heatplot <- function(data, cl){
  localdir = Sys.getenv('tempdir', unset=tempdir())
  output_plot = tempfile('plot', tmpdir=tempdir, fileext='.png')
  png(filename=output_plot, width=314, height=400, units="px")
  k <- max(cl)

  cluster_index <- matrix()
  length(cluster_index) <- k
  for(i in 1:k){ cluster_index[i] <- length(cl[cl == i]) }
  ord <- order(cluster_index, decreasing=T)
  temp = data[cl == ord[1],];
  seperation <- matrix(nrow=10,ncol=dim(data)[2])
  temp <- rbind(temp, seperation)
  for(i in 2:k){ 
    temp <- rbind(temp , data[cl == ord[i],],  seperation)
  }
  pheatmap(temp[,1:dim(data)[2]], cluster_rows=F, cluster_cols=F,
           show_rownames=F, show_colnames=F, width=100, height=200,
           border_color=NA, color=colorRampPalette(rev(c("#D73027", "#FC8D59",
           "#FEE090", "#FFFFBF", "#E0F3F8", "#91BFDB", "#4575B4")))(100))
  dev.off()
  return(output_plot)
}

output_mrna_heatplot = render_heatplot(t(mRNA.m), mRNACluster.b)
output_mirna_heatplot = render_heatplot(t(miRNA.m), miRNACluster.b)

# generate visualization data
vis_data <- function(mRNA.cl, miRNA.cl){
  mRNA.k <- length(mRNA.cl$size)
  mRNA.label <- rep("mRNA", mRNA.k)
  mRNA.key <- as.character(sort.int(mRNA.cl$size,decreasing = T,index.return = T)$ix)
  mRNA.height <- sort.int(mRNA.cl$size,decreasing = T,index.return = T)$x
  mRNA.id <- mRNA.key
  mRNA.offsetValue <- c(0, cumsum(sort.int(mRNA.cl$size,decreasing = T,index.return = T)$x)[1:mRNA.k-1])
  rv1 <- data.frame(label = mRNA.label, key = mRNA.key, height = mRNA.height, order = c(0:(mRNA.k-1)),
                  offsetValue = mRNA.offsetValue, links = c(1:mRNA.k), incoming = c(1:mRNA.k))

  miRNA.k <- length(miRNA.cl$size)
  miRNA.label <- rep("miRNA", miRNA.k)
  miRNA.key <- as.character(sort.int(miRNA.cl$size, decreasing = T,index.return = T)$ix)
  miRNA.height <- sort.int(miRNA.cl$size,decreasing = T,index.return = T)$x
  miRNA.id <- mRNA.key
  miRNA.offsetValue <- c(0, cumsum(sort.int(miRNA.cl$size,decreasing = T,index.return = T)$x)[1:miRNA.k-1])
  rv2 <- data.frame(label = miRNA.label, key = miRNA.key, height = miRNA.height, order = c(0:(miRNA.k-1)),
                  offsetValue = miRNA.offsetValue, links = c(1:miRNA.k), incoming = c(1:miRNA.k))

  df <- data.frame(source=integer(),
                   target=integer(), 
                   count=integer(), 
                   outOffset=integer(),
                   inOffset= integer())

  for (i in 1:length(mRNA.cl$size)){
    for (j in 1:length(miRNA.cl$size)){
      count <- sum((mRNA.cl$cluster == as.integer(mRNA.key[i]) & miRNA.cl$cluster == as.integer(miRNA.key[j])))
      df <- rbind(df,data.frame(source=as.integer(mRNA.key[i]),
                                target=as.integer(miRNA.key[j]), 
                                count=count, 
                                outOffset=0,
                                inOffset=0)) 
    }
  }
  for (i in 1:nrow(df)){
    source <- df$source[i]
    target <- df$target[i]
    df$outOffset[i] <- sum(df$count[df$source == source & df$count>df$count[i]])
    df$inOffset[i] <- sum(df$count[df$target == target & df$count>df$count[i]])
  }

  rv1$links <- lapply(mRNA.key, function(x){
    idx <- df$source == as.numeric(x)
    tmp <- df[idx,]
    return(tmp[order(tmp$count, decreasing = T),])
  })
  rv2$incoming <- lapply(miRNA.key, function(x){
    idx <- df$target == as.numeric(x)
    tmp <- df[idx,]
    return(tmp[order(tmp$count, decreasing = T),])
  })
  return(list(rv1,rv2))
}

clusters <- vis_data(mRNACluster.cl, miRNACluster.cl)

# Make these values available as outputs
clustersJSON <- toJSON(clusters)

# Make a single output object.  This will get passed to the second half of the
# job along with the user selections from the parallel sets.
transferData = list("clusters"=list("cl1"=mRNACluster.cl, "cl2"=miRNACluster.cl, "combine"=clusters), "mRNACluster"=mRNACluster.cl, "miRNACluster"=miRNACluster.cl, "clinical"=clinical.m)


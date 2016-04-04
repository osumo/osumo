require(jsonlite)
require(survival)

groups <- fromJSON(groups)

clusters <- transferData$clusters
mRNACluster.cl <- transferData$mRNACluster
miRNACluster.cl <- transferData$miRNACluster
clinical.m <- transferData$clinical

outputData = clinical.m

localdir = Sys.getenv('tempdir', unset=tempdir())
dataplot = tempfile('plot', tmpdir=tempdir, fileext='.png')
png(filename=dataplot, width=800, height=600, units="px", pointsize=8)
if ((length(groups$GROUP1$node) > 0 | length(groups$GROUP1$link) > 0) &
    (length(groups$GROUP2$node) > 0 | length(groups$GROUP2$link) > 0)) {
  # idx
  idx.1 <- rep(FALSE, length(clusters$cl1$cluster))
  # num of nodes in group1 & 2
  num.node.group1 <- length(groups$GROUP1$node)
  if (num.node.group1 > 0){
    for (i in 1:num.node.group1){
      if(groups$GROUP1$node[[i]]$label == "mRNA"){
        idx.1 <- (idx.1 | as.numeric(clusters$cl1$cluster)== as.numeric(groups$GROUP1$node[[i]]$key))
      }
      else{
        idx.1 <- (idx.1 | as.numeric(clusters$cl2$cluster)== as.numeric(groups$GROUP1$node[[i]]$key))
      }
    }
  }
  # num of links in group1
  num.link.group1 <- length(groups$GROUP1$link)
  if (num.link.group1 > 0){
    for (i in 1:num.link.group1){
      SO <- as.numeric(groups$GROUP1$link[[i]]$source)
      TA <- as.numeric(groups$GROUP1$link[[i]]$target)
      idx.1 <- idx.1 | (as.numeric(clusters$cl1$cluster) == SO & as.numeric(clusters$cl2$cluster) == TA)
    }
  }

  idx.2 <- rep(FALSE, length(clusters$cl2$cluster))
  num.node.group2 <- length(groups$GROUP2$node)
  if (num.node.group2 > 0){
    for (i in 1:num.node.group2){
      if(groups$GROUP2$node[[i]]$label == "mRNA"){
        idx.2 <- (idx.2 | as.numeric(clusters$cl1$cluster)== as.numeric(groups$GROUP2$node[[i]]$key))
      }
      else{
        idx.2 <- (idx.2 | as.numeric(clusters$cl2$cluster)== as.numeric(groups$GROUP2$node[[i]]$key))
      }
    }
  }
  # num of links in group1
  num.link.group2 <- length(groups$GROUP2$link)
  if (num.link.group2 > 0){
    for (i in 1:num.link.group2){
      SO <- as.numeric(groups$GROUP2$link[[i]]$source)
      TA <- as.numeric(groups$GROUP2$link[[i]]$target)
      idx.2 <- idx.2 | (as.numeric(clusters$cl1$cluster) == SO & as.numeric(clusters$cl2$cluster) == TA)
    }
  }

  TIME <- c(clinical.m$time[which(idx.1)],clinical.m$time[which(idx.2)])
  STATUS <- c(clinical.m$cencer[which(idx.1)],clinical.m$cencer[which(idx.2)])

  fit<-survfit(Surv(TIME, STATUS) ~ as.factor(c(rep(1, sum(idx.1)), rep(2, sum(idx.2)))))
  sdf<-survdiff(Surv(TIME, STATUS) ~ as.factor(c(rep(1, sum(idx.1)), rep(2, sum(idx.2)))))

  # Simple plot
  # plot(fit, col=c(1:5), lwd=4, cex.axis=1.5, font.axis=2)

  # Plot with axes labels and title
  plot(fit, col=c(1:5), lwd=4, cex.axis=1.5, font.axis=1)
  p.val = (1 - pchisq(sdf$chisq, length(sdf$n) - 1))
  mtext("Time (days)", side=1, line=2.5, col="black", cex=1.5)
  mtext("Survival Probability", side=2, line=2.5, col="black", cex=1.5)
  text(50, 0.05, paste("p-value =", round(p.val, digits=4)), adj=c(0,0), font=2.5, cex=1.4) # You may need to adjust the coordinates here for the different dataset
  title(main=list("KM Survival Plot", cex=2, font=2)) 
  legend(50, 0.18, c('Group 1', 'Group 2'), col=c(1:2), lwd=2, cex=1.5)  # You may need to adjust the coordinates here for the different dataset 

}
dev.off()


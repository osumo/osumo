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

mRNACluster.b <- as.numeric(kmeans(t(mRNA.m), centers = mrna_clusters)$cluster)
miRNACluster.b <- as.numeric(kmeans(t(miRNA.m), centers = mirna_clusters)$cluster)

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

#    output$clustering.info = renderPlot({
#      if(length(input$mydata$GROUP1$node) > 0){
#      idx<-c(rep(1,400),rep(2,223))
#      sm <- sample.int(623, size = 120)
#      fit<-survfit(Surv(clinical.m$time, clinical.m$cencer) ~ as.factor(idx))
#      sdf<-survdiff(Surv(clinical.m$time, clinical.m$cencer) ~ as.factor(idx))
#      p.val =( 1 - pchisq(sdf$chisq, length(sdf$n) - 1) )
#      plot(fit, col=c(1:5),lwd=4,cex.axis=1.5, font.axis = 2)}
#      
#    })

#  
#  ## helper function
#  file_content <- function(file) {
#    return(readChar(file, file.info(file)$size))
#  }
#  ## generate visualization data
#  vis_data <- function(mRNA.cl, miRNA.cl){
#    mRNA.k<-length(mRNA.cl$size)
#    mRNA.label<- rep("mRNA", mRNA.k)
#    mRNA.key <- as.character(sort.int(mRNA.cl$size,decreasing = T,index.return = T)$ix)
#    mRNA.height <- sort.int(mRNA.cl$size,decreasing = T,index.return = T)$x
#    mRNA.id <- mRNA.key
#    mRNA.offsetValue <-c(0, cumsum(sort.int(mRNA.cl$size,decreasing = T,index.return = T)$x)[1:mRNA.k-1])
#    rv1<-data.frame(label = mRNA.label, key = mRNA.key, height = mRNA.height, order = c(0:(mRNA.k-1)),
#                    offsetValue = mRNA.offsetValue, links = c(1:mRNA.k), incoming = c(1:mRNA.k))
#    
#    miRNA.k<-length(miRNA.cl$size)
#    miRNA.label<- rep("miRNA", miRNA.k)
#    miRNA.key <- as.character(sort.int(miRNA.cl$size, decreasing = T,index.return = T)$ix)
#    miRNA.height <- sort.int(miRNA.cl$size,decreasing = T,index.return = T)$x
#    miRNA.id <- mRNA.key
#    miRNA.offsetValue <-c(0, cumsum(sort.int(miRNA.cl$size,decreasing = T,index.return = T)$x)[1:miRNA.k-1])
#    rv2<-data.frame(label = miRNA.label, key = miRNA.key, height = miRNA.height, order = c(0:(miRNA.k-1)),
#                    offsetValue = miRNA.offsetValue, links = c(1:miRNA.k), incoming = c(1:miRNA.k))
#    
#    df <- data.frame(source=integer(),
#                     target=integer(), 
#                     count=integer(), 
#                     outOffset=integer(),
#                     inOffset= integer())
#    
#    for (i in 1:length(mRNA.cl$size)){
#      for (j in 1:length(miRNA.cl$size)){
#        count<-sum((mRNA.cl$cluster == as.integer(mRNA.key[i]) & miRNA.cl$cluster == as.integer(miRNA.key[j])))
#        df<-rbind(df,data.frame(source= as.integer(mRNA.key[i]),
#                                target=as.integer(miRNA.key[j]), 
#                                count=count, 
#                                outOffset=0,
#                                inOffset= 0 )) 
#      }
#    }
#    for (i in 1:nrow(df)){
#      source <- df$source[i]
#      target <- df$target[i]
#      df$outOffset[i] <- sum(df$count[df$source == source & df$count>df$count[i]])
#      df$inOffset[i] <- sum(df$count[df$target == target & df$count>df$count[i]])
#    }
#    
#    rv1$links <- lapply(mRNA.key, function(x){
#      idx<- df$source == as.numeric(x)
#      tmp<- df[idx,]
#      return(tmp[order(tmp$count, decreasing = T),])
#    })
#    rv2$incoming <- lapply(miRNA.key, function(x){
#      idx<- df$target == as.numeric(x)
#      tmp<- df[idx,]
#      return(tmp[order(tmp$count, decreasing = T),])
#    })
#    return(list(rv1,rv2))
#  }
#  
#  
#  # plot the survival image
#  SURV_PLOT<-function(g1,g2,g3, plotname){
#    op <- read.csv("../data/input/time_cencer.csv")
#    
#    mRNA_cluster <-read.csv("../data/input/mRNA_group.csv")
#    miRNA_cluster<-read.csv("../data/input/miRNA_group.csv")
#    
#    mRNA_cluster<-as.factor(mRNA_cluster[,2])
#    miRNA_cluster<-as.factor(miRNA_cluster[,2])
#    indicator<-data.frame(mRNA_cluster=mRNA_cluster, miRNA_cluster=miRNA_cluster,
#                          joint=interaction(mRNA_cluster,miRNA_cluster))
#    
#    index <- matrix()
#    length(index)<-length(mRNA_cluster)
#    if(is.na(g1)){  
#      png(type='cairo',filename=plotname,width=700,height=500)
#      #cat('save file')
#      sink('/dev/null')  
#      plot(x = rep(-50, 200), y = rep(0,200),ylim=c(0,1),xlim=c(1,230), xlab="Time (Month)", ylab = "Survival Probability", cex.axis=1.5, font.axis = 2)
#      
#      text(5, 0.05, paste("p-value =", 0), adj = c(0,0), font=2 )
#      title(main = list("Kaplan-Meier Survival Plot", cex = 2, font = 2))
#      #legend(140,1, c(paste(g1,'(n = 301)'), paste(g2,'(n = 322)')), col=c(1:2), lwd=3)
#      dev.off()
#      sink()
#    }
#    else{
#      if(!is.na(g1))
#      {
#        g1_<-unlist(strsplit(g1, ","))
#        l<-length(g1_)
#        for(i in 1:l){
#          #cat(g1[i])
#          if(substr(g1_[i], 1, 1)=='m')
#          {
#            if(substr(g1_[i], 2, 2) == 'i'){
#              index[which(indicator[,2]== unlist(strsplit(g1_[i],"_"))[2])] <-1
#            }
#            else{
#              index[which(indicator[,1]== unlist(strsplit(g1_[i],"_"))[2])] <-1
#            }
#          }
#          else
#          {
#            index[which(indicator[,3]==g1_[i])] <-1
#          }
#        }
#        #cat('\n')
#      }
#      else{
#      }
#      if(!is.na(g2))
#      {
#        g2_<-unlist(strsplit(g2,","))
#        l<-length(g2_)
#        for(i in 1:l){
#          #cat(g2_[i])
#          if(substr(g2_[i], 1, 1)=='m')
#          {
#            if(substr(g2_[i], 2, 2) == 'i'){
#              index[which(indicator[,2]==unlist(strsplit(g2_[i],"_"))[2])] <-2
#            }
#            else{
#              index[which(indicator[,1]==unlist(strsplit(g2_[i],"_"))[2])] <-2
#            }
#          }
#          else
#          {
#            index[which(indicator[,3]==g2_[i])] <-2     
#          }
#        }
#      }
#      if(!is.na(g3))
#      {
#        g3<-unlist(strsplit(g3,","))	
#        #cat(g3)
#      }
#      
#      
#      fit<-survfit(Surv(op[which(!is.na(index)),2]/30,op[which(!is.na(index)),3])~as.factor(index[which(!is.na(index))]))
#      sdf<-survdiff(Surv(op[which(!is.na(index)),2]/30,op[which(!is.na(index)),3])~as.factor(index[which(!is.na(index))]))  
#      p.val =( 1 - pchisq(sdf$chisq, length(sdf$n) - 1) )
#      #cat(p.val)
#      png(type='cairo',filename=plotname,width=700,height=500)
#      #cat('save file')
#      sink('/dev/null')  
#      #plot(fit, col=c(1:2), xlab="Time(Month)", ylab="Survival Probability",lwd=3)
#      plot(fit, col=c(1:2),lwd=4,cex.axis=1.5, font.axis = 2)
#      
#      mtext("Time (Month)", side=1, line=2.5, col="black", cex=1.5)
#      mtext("Survival Probability", side=2, line=2.5, col="black", cex=1.5)
#      
#      text(5, 0.05, paste("p-value =", round(p.val, digits = 10)), adj = c(0,0), font=2, cex=1.4 )
#      title(main = list("Kaplan-Meier Survival Plot", cex = 2, font = 2))
#      #legend(140,1, c(paste(g1,'(n = 301)'), paste(g2,'(n = 322)')), col=c(1:2), lwd=3)
#      legend(140,1, c('group 1', 'group 2'),col=c(1:2), lwd=3)
#      
#      dev.off()
#      sink()
#    }
#  }


################
# server.R
#  shinyServer(function(input, output, session) {
#    loadData.mRNA <- function(){
#      if (is.null(input$mRNA)){
#        return(NULL)}else{mRNA.m<<-read.csv(input$mRNA$datapath)}
#      return(dim( mRNA.m )) 
#    }
#    loadData.miRNA <- function(){
#      if (is.null(input$miRNA)){
#        return(NULL)}else{miRNA.m<<-read.csv(input$miRNA$datapath)}
#      return(dim(miRNA.m))
#    }
#    loadData.clinical<- function(){
#      if (is.null(input$clinical)){
#        return(NULL)}else{clinical.m<<-read.csv(input$clinical$datapath)}
#      return(dim(clinical.m))
#    }
#    
#    clusters <- reactiveValues(cl1 = NULL, cl2 = NULL, combine = NULL)
#    
#    mRNACluster.b <- eventReactive(input$mRNACluster, {
#      clusters$cl1 <- kmeans(t(mRNA.m), centers = input$mRNA_clusters_k)
#      return(as.numeric(clusters$cl1$cluster))
#    })
#    
#    miRNACluster.b <- eventReactive(input$miRNACluster, {
#      clusters$cl2 <-kmeans(t(miRNA.m), centers = input$miRNA_clusters_k)
#      return(as.numeric(clusters$cl2$cluster))
#    })
#    
#    output$mRNA.info<-reactive({loadData.mRNA()})
#    output$miRNA.info<-reactive({loadData.miRNA()})
#    output$clinical.info<-reactive({loadData.clinical()})
#  
#    
#    output$mRNAheatmapplot <- renderPlot({
#      cl<-mRNACluster.b()
#      k <- max(cl)
#      data <- t(mRNA.m)
#      
#      cluster_index<-matrix()
#      length(cluster_index)<-k
#      for(i in 1:k){ cluster_index[i]<-length(cl[cl == i]) }
#      ord<-order(cluster_index, decreasing=T)
#      temp= data[cl == ord[1],];
#      seperation<-matrix(nrow=10,ncol=dim(data)[2])
#      temp<-rbind(temp, seperation)
#      for(i in 2:k){ 
#  
#        temp<-rbind(temp , data[cl == ord[i],],  seperation)
#      }
#      pheatmap(temp[,1:dim(data)[2]],cluster_rows=F,cluster_cols=F, show_rownames=F, 
#               show_colnames=F, width = 100, height = 200, border_color=NA, 
#               color=colorRampPalette(rev(c("#D73027", "#FC8D59", "#FEE090", "#FFFFBF", "#E0F3F8", "#91BFDB", "#4575B4")))(100))
#    })
#    
#    output$miRNAheatmapplot <- renderPlot({
#      cl<-miRNACluster.b()
#      k <- max(cl)
#      data <- t(miRNA.m)
#      
#      cluster_index<-matrix()
#      length(cluster_index)<-k
#      for(i in 1:k){ cluster_index[i]<-length(cl[cl == i]) }
#      ord<-order(cluster_index, decreasing=T)
#      temp= data[cl == ord[1],];
#      seperation<-matrix(nrow=10,ncol=dim(data)[2])
#      temp<-rbind(temp, seperation)
#      for(i in 2:k){ 
#        temp<-rbind(temp , data[cl == ord[i],],  seperation)
#      }
#      pheatmap(temp[,1:dim(data)[2]],cluster_rows=F,cluster_cols=F, show_rownames=F, 
#               show_colnames=F, width = 100, height = 200, border_color=NA, 
#               color=colorRampPalette(rev(c("#D73027", "#FC8D59", "#FEE090", "#FFFFBF", "#E0F3F8", "#91BFDB", "#4575B4")))(100))
#    })
#    
#    output$clustering.info = renderPlot({
#      if(length(input$mydata$GROUP1$node) > 0){
#      idx<-c(rep(1,400),rep(2,223))
#      sm <- sample.int(623, size = 120)
#      fit<-survfit(Surv(clinical.m$time, clinical.m$cencer) ~ as.factor(idx))
#      sdf<-survdiff(Surv(clinical.m$time, clinical.m$cencer) ~ as.factor(idx))
#      p.val =( 1 - pchisq(sdf$chisq, length(sdf$n) - 1) )
#      plot(fit, col=c(1:5),lwd=4,cex.axis=1.5, font.axis = 2)}
#      
#    })
#    
#    observe({
#      if(!is.null(clusters$cl1) & !is.null(clusters$cl2)){
#        clusters$combine <- vis_data(clusters$cl1, clusters$cl2)
#        session$sendCustomMessage(type='myCallbackHandler', toJSON(clusters$combine)) 
#      }
#    })
#  })


####### surv.r
#  require(survival)
#  load(input_path)
#  
#  k <- num_clusters
#  cl <- kmeans(t(ge_filt), centers = k)
#  fit <- survfit(Surv(surv$time, surv$censor) ~ as.factor(cl$cluster))
#  sdf <- survdiff(Surv(surv$time, surv$censor) ~ as.factor(cl$cluster))
#  localdir = Sys.getenv('tempdir', unset=tempdir())
#  dataplot = tempfile('plot', tmpdir=tempdir, fileext='.png')
#  png(filename=dataplot, width=800, height=600, units="px", pointsize=8)
#  plot(fit, col=c(1:5), lwd=4, cex.axis=1.5, font.axis=2)
#  dev.off()

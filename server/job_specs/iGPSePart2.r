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
if ((length(groups['GROUP1']['node']) > 0 || length(groups['GROUP1']['link']) > 0) && ((length(groups['GROUP2']['node']) > 0 || length(groups['GROUP2']['link']) > 0))) {
  idx <- c(rep(1,400),rep(2,223))
  fit <- survfit(Surv(clinical.m$time, clinical.m$cencer) ~ as.factor(idx))
  sdf <- survdiff(Surv(clinical.m$time, clinical.m$cencer) ~ as.factor(idx))
  p.val = (1 - pchisq(sdf$chisq, length(sdf$n) - 1))
  plot(fit, col=c(1:5), lwd=4, cex.axis=1.5, font.axis=2)
}
dev.off()


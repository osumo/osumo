require(survival)
load(input_rdata)

k <- num_clusters
cl <- kmeans(t(ge_filt), centers = k)
fit <- survfit(Surv(surv$time, surv$censor) ~ as.factor(cl$cluster))
sdf <- survdiff(Surv(surv$time, surv$censor) ~ as.factor(cl$cluster))
localdir = Sys.getenv('tempdir', unset=tempdir())
dataplot = tempfile('plot', tmpdir=tempdir, fileext='.png')
png(filename=dataplot, width=800, height=600, units="px", pointsize=8)
# Simple plot
# plot(fit, col=c(1:5), lwd=4, cex.axis=1.5, font.axis=2)

# Plot with axes labels and title
plot(fit, col=c(1:5), lwd=4, cex.axis=1, font.axis=1)
p.val = (1 - pchisq(sdf$chisq, length(sdf$n) - 1))
mtext("Time (days)", side=1, line=2.5, col="black", cex=1.5)
mtext("Survival Probability", side=2, line=2.5, col="black", cex=1.5)
text(50, 0.09, paste("p-value =", round(p.val, digits=4)), adj=c(0,0), font=2.5, cex=1.4) # You may need to adjust the coordinates here for the different dataset
title(main=list("KM Survival Plot", cex=2, font=2))
# legend(5000, 0.65, c('G1', 'G2'), col=c(1:2), lwd=2, cex=1)  # You may need to adjust the coordinates here for the different dataset

dev.off()

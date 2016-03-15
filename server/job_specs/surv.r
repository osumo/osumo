require(survival)
load(input_path)

k <- num_clusters
cl <- kmeans(t(ge_filt), centers = k)
fit <- survfit(Surv(surv$time, surv$censor) ~ as.factor(cl$cluster))
sdf <- survdiff(Surv(surv$time, surv$censor) ~ as.factor(cl$cluster))
png(filename=png_output_path, width=800, height=600, units="px", pointsize=8)
plot(fit, col=c(1:5), lwd=4, cex.axis=1.5, font.axis=2)
dev.off()
dataplot <- png_output_path

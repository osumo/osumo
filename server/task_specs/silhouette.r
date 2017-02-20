# Read Data
dmiRNA = read.csv(input_path)

#clustering
color <- palette()
require(cluster)
k <- num_clusters
cl <- pam(t(dmiRNA),k)
si <- silhouette(cl)

localdir = Sys.getenv('tempdir', unset=tempdir())
dataplot1 = tempfile('plot', tmpdir=tempdir, fileext='.png')
png(filename=dataplot1, width=800, height=800, units="px") 

plot(si, col=color[1:k], border=NA) # with cluster-wise coloring

dev.off()


# plot the graph
require(cccd)
require(igraph)
ADJmiRNA <- as.matrix(dist(t(dmiRNA)))
g <- nng(ADJmiRNA, k=3)
g <- as.undirected(g)
V(g)$color <- color[cl$clustering]

localdir = Sys.getenv('tempdir', unset=tempdir())
dataplot2 = tempfile('plot', tmpdir=tempdir, fileext='.png')
png(filename=dataplot2, width=800, height=800, units="px", pointsize=8)

plot(g, vertex.size=3, layout=layout.kamada.kawai, vertex.label=NA)

dev.off()


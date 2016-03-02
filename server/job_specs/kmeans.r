
input <- read.table(input_path, header=has_header, sep=",")

cl <- kmeans(input, num_clusters)

centers <- as.data.frame(cl$centers)
clusters <- as.data.frame(cl$cluster)


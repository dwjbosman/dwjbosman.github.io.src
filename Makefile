

install:
	docker run -it --privileged --rm -v $(shell pwd):/srv -w="/srv" -p="80:8000" optimized/docker-gatsbyjs npm install


build:
	docker run -it --privileged --rm -v $(shell pwd):/srv -w="/srv" -p="80:8000" optimized/docker-gatsbyjs gatsby build


develop:
	docker run -it --privileged --rm -v $(shell pwd):/srv -w="/srv" -p="80:8000" optimized/docker-gatsbyjs gatsby develop


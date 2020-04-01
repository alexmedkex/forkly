<script>
	export let segment;
</script>

<style src="./Nav.scss" lang="scss"></style>

<nav>
	<ul>
		<li><a aria-current='{segment === undefined ? "page" : undefined}' href='.'>Home</a></li>
		<li><a aria-current='{segment === "newrecipe" ? "page" : undefined}' href='newrecipe'>New Recipe</a></li>

		<!-- for the blog link, we're using rel=prefetch so that Sapper prefetches
		     the blog data when we hover over the link or tap it on a touchscreen -->
		<li><a rel=prefetch aria-current='{segment === "blog" ? "page" : undefined}' href='blog'>blog</a></li>
	</ul>
</nav>

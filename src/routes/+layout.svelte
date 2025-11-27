<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { AuthNav } from '$lib/components/blocks';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, // 5 minutes
				refetchOnWindowFocus: false
			}
		}
	});

	let { children, data } = $props();
</script>

<QueryClientProvider client={queryClient}>
	<AuthNav user={data.user} />
	{@render children()}
</QueryClientProvider>

<script lang="ts">
	import { base } from "$app/paths";
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { DarkModeToggle } from '$lib/components/ui/darkmode-toggle';
	import { coffeeBagStore, coffeeBrewStore } from '$lib/storage';
	import { testCoffeeBags, testCoffeeBrews } from '$lib/test-data';
	import Hammer from "@lucide/svelte/icons/hammer"
	import {
		NavigationMenuRoot as NavigationMenu,
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList
	} from '$lib/components/ui/navigation-menu';

	interface Props {
		currentPath: string;
	}

	let { currentPath }: Props = $props();

	function toggleTestData() {
		// Toggle each bag: remove if exists, add if not
		testCoffeeBags.forEach(bag => {
			if (coffeeBagStore.getById(bag.id)) {
				coffeeBagStore.remove(bag.id);
			} else {
				coffeeBagStore.add(bag);
			}
		});

		// Toggle each brew: remove if exists, add if not
		testCoffeeBrews.forEach(brew => {
			if (coffeeBrewStore.getById(brew.id)) {
				coffeeBrewStore.remove(brew.id);
			} else {
				coffeeBrewStore.add(brew);
			}
		});
	}

	// Check if any test data is currently loaded
	let testDataLoaded = $derived(
		testCoffeeBags.some(bag => coffeeBagStore.getById(bag.id)) ||
		testCoffeeBrews.some(brew => coffeeBrewStore.getById(brew.id))
	);

	const navItems = [
		// fixme: use resolve() instead of base (deprecated)
		{ href: `${base}/`, label: 'Dial-in' },
		{ href: `${base}/stats`, label: 'Stats' },
		{ href: `${base}/how-to`, label: 'How-To' }
	];

	function isCurrentPath(href: string): boolean {
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href);
	}

	let mobileMenuOpen = $state(false);
</script>

<div class="border-b">
	<div class="mx-auto grid max-w-7xl grid-cols-12 gap-4 p-2">
		<NavigationMenu class="col-span-8">
			<Button
				variant="ghost"
				size="sm"
				class="pr-4 pl-0 lg:hidden"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			>
				<span class="text-lg">☰</span>
				<span class="sr-only">Toggle Menu</span>
			</Button>
			<NavigationMenuList>
				{#each navItems as item}
					<NavigationMenuItem>
						<NavigationMenuLink
							href={item.href}
							class="font-medium transition-colors focus:outline-none {isCurrentPath(item.href)
								? 'font-semibold text-foreground'
								: 'text-muted-foreground'}"
						>
							{item.label}
						</NavigationMenuLink>
					</NavigationMenuItem>
				{/each}
			</NavigationMenuList>
		</NavigationMenu>

		<div class="flex col-span-4 gap-2 pt-1 ml-auto">
			<Button variant={testDataLoaded ? "default" : "outline"} size="icon" onclick={toggleTestData}><Hammer /></Button>
			<DarkModeToggle />
		</div>
	</div>
	<!-- Mobile dropdown menu -->
	{#if mobileMenuOpen}
		<div class="border-t bg-background px-4 py-2">
			<nav class="flex flex-col space-y-2">
				{#each navItems as item}
					<Button
						variant={isCurrentPath(item.href) ? 'secondary' : 'ghost'}
						class="justify-start"
						onclick={() => {
							goto(item.href);
							mobileMenuOpen = false;
						}}
					>
						{item.label}
					</Button>
				{/each}
			</nav>
		</div>
	{/if}
</div>
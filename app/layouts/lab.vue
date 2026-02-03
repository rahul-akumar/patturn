<template>
  <div class="flex h-screen flex-col overflow-hidden">
    <SiteHeader />
    <div class="flex flex-1 overflow-hidden">
      <LabNav />
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

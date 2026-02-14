<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <h3 class="text-lg font-semibold mb-4">{{ __("مرحباً بك!") }} 👋</h3>
                    <p class="text-gray-600 mb-6">{{ __("You're logged in! Choose a tool to get started.") }}</p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Story Generator Card -->
                        <a href="{{ route('stories.index') }}" class="block p-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                            <div class="text-white">
                                <div class="text-4xl mb-3">📱</div>
                                <h4 class="text-xl font-bold mb-2">Instagram Stories Generator</h4>
                                <p class="text-purple-100 text-sm">مولد ستوريز إنستغرام - أنشئ ستوريز احترافية بسهولة</p>
                            </div>
                        </a>

                        <!-- Placeholder for future tools -->
                        <div class="block p-6 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                            <div class="text-gray-400">
                                <div class="text-4xl mb-3">🎨</div>
                                <h4 class="text-xl font-bold mb-2">Coming Soon</h4>
                                <p class="text-sm">More tools coming soon...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>


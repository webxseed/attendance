<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


use App\Models\Year;

class YearController extends Controller
{
    public function index()
    {
        return Year::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'start_year' => 'required|string|max:4',
            'end_year' => 'required|string|max:4|gte:start_year',
        ]);

        $name = $validated['title'] . ' ' . $validated['start_year'] . '-' . $validated['end_year'];
        
        // Find existing or create
        $year = Year::firstOrCreate(
            [
                'title' => $validated['title'],
                'start_year' => $validated['start_year'],
                'end_year' => $validated['end_year'],
            ],
            ['name' => $name]
        );

        return response()->json($year, 201);
    }

    public function update(Request $request, Year $year)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'start_year' => 'required|string|max:4',
            'end_year' => 'required|string|max:4|gte:start_year',
        ]);

        $name = $validated['title'] . ' ' . $validated['start_year'] . '-' . $validated['end_year'];
        
        $year->update([
            'title' => $validated['title'],
            'start_year' => $validated['start_year'],
            'end_year' => $validated['end_year'],
            'name' => $name,
        ]);

        return response()->json($year);
    }
}

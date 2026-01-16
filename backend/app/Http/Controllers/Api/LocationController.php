<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LocationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'lat' => 'numeric|between:-90,90',
            'lon' => 'numeric|between:-180,180',
            'max_distance_km' => 'numeric|min:0',
            'features' => 'array',
            'features.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $query = Location::query()->active();

        // Apply distance calculation if lat/lon provided
        if ($request->has('lat') && $request->has('lon')) {
            $lat = $request->lat;
            $lon = $request->lon;
            $earthRadius = 6371; // km

            $haversine = "(
                6371 * ACOS(
                    COS(RADIANS(latitude)) * COS(RADIANS($lat)) *
                    COS(RADIANS(longitude) - RADIANS($lon)) +
                    SIN(RADIANS(latitude)) * SIN(RADIANS($lat))
                )
            )";

            $query->selectRaw("*, {$haversine} as distance_km")
                ->orderBy('distance_km', 'asc');

            // Filter by max distance if provided
            if ($request->has('max_distance_km')) {
                $query->having('distance_km', '<=', $request->max_distance_km);
            }
        }

        // Apply feature filtering
        if ($request->has('features')) {
            $features = $request->features;
            foreach ($features as $feature) {
                $query->whereJsonContains('features', $feature);
            }
        }

        $locations = $query->get();

        return response()->json([
            'data' => $locations,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $location = Location::with('products')->findOrFail($id);

        return response()->json([
            'data' => $location,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'postal_code' => 'required|string|max:10',
            'country' => 'string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'operating_hours' => 'required|array',
            'operating_hours.mon' => 'required|array',
            'operating_hours.mon.open' => 'required|string|date_format:H:i',
            'operating_hours.mon.close' => 'required|string|date_format:H:i',
            'operating_hours.mon.is_closed' => 'required|boolean',
            'operating_hours.tue' => 'required|array',
            'operating_hours.tue.open' => 'required|string|date_format:H:i',
            'operating_hours.tue.close' => 'required|string|date_format:H:i',
            'operating_hours.tue.is_closed' => 'required|boolean',
            'operating_hours.wed' => 'required|array',
            'operating_hours.wed.open' => 'required|string|date_format:H:i',
            'operating_hours.wed.close' => 'required|string|date_format:H:i',
            'operating_hours.wed.is_closed' => 'required|boolean',
            'operating_hours.thu' => 'required|array',
            'operating_hours.thu.open' => 'required|string|date_format:H:i',
            'operating_hours.thu.close' => 'required|string|date_format:H:i',
            'operating_hours.thu.is_closed' => 'required|boolean',
            'operating_hours.fri' => 'required|array',
            'operating_hours.fri.open' => 'required|string|date_format:H:i',
            'operating_hours.fri.close' => 'required|string|date_format:H:i',
            'operating_hours.fri.is_closed' => 'required|boolean',
            'operating_hours.sat' => 'required|array',
            'operating_hours.sat.open' => 'required|string|date_format:H:i',
            'operating_hours.sat.close' => 'required|string|date_format:H:i',
            'operating_hours.sat.is_closed' => 'required|boolean',
            'operating_hours.sun' => 'required|array',
            'operating_hours.sun.open' => 'required|string|date_format:H:i',
            'operating_hours.sun.close' => 'required|string|date_format:H:i',
            'operating_hours.sun.is_closed' => 'required|boolean',
            'features' => 'required|array',
            'features.*' => 'string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $location = Location::create($request->all());

        return response()->json([
            'data' => $location,
            'message' => 'Location created successfully',
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $location = Location::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'address_line1' => 'string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'string|max:100',
            'postal_code' => 'string|max:10',
            'country' => 'string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'string|max:20',
            'email' => 'nullable|email|max:255',
            'operating_hours' => 'array',
            'features' => 'array',
            'features.*' => 'string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $location->update($request->all());

        return response()->json([
            'data' => $location,
            'message' => 'Location updated successfully',
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $location = Location::findOrFail($id);

        // Check if location has orders
        if ($location->orders()->exists()) {
            return response()->json([
                'message' => 'Cannot delete location with existing orders',
                'errors' => [
                    'location' => ['Location has associated orders'],
                ],
            ], 422);
        }

        $location->delete();

        return response()->json(null, 204);
    }
}

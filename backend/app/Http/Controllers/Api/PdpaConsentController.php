<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PdpaConsent;
use App\Services\PdpaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PdpaConsentController extends Controller
{
    protected PdpaService $pdpaService;

    public function __construct(PdpaService $pdpaService)
    {
        $this->pdpaService = $pdpaService;
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'consent_type' => 'required|in:marketing,analytics,third_party',
            'consent_version' => 'required|string|max:20',
            'consent_wording' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $customerId = $request->user()?->id ?? null;
        $consent = $this->pdpaService->recordConsent(
            $customerId,
            $request->consent_type,
            $request->consent_wording,
            $request->consent_version,
            $request
        );

        return response()->json([
            'data' => $consent,
            'message' => 'Consent recorded successfully',
        ], 201);
    }

    public function withdraw(Request $request, string $id): JsonResponse
    {
        $consent = PdpaConsent::findOrFail($id);

        if ($consent->customer_id !== $request->user()?->id) {
            return response()->json([
                'message' => 'Unauthorized',
                'errors' => [
                    'consent' => ['You can only withdraw your own consents'],
                ],
            ], 403);
        }

        $this->pdpaService->withdrawConsent($id);

        return response()->json([
            'message' => 'Consent withdrawn successfully',
        ]);
    }

    public function export(string $id): JsonResponse
    {
        $data = $this->pdpaService->exportData($id);

        return response()->json([
            'data' => $data,
        ]);
    }
}

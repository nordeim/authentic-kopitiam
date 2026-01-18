<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Order;
use Illuminate\Support\Facades\Validator;

class VerifyOrderOwnership
{
    /**
     * Verify order ownership or guest access credentials.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $order = Order::findOrFail($request->route('id'));
        
        if ($request->user()) {
            if ($order->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized',
                    'errors' => [
                        'order' => ['You can only manage your own orders'],
                    ],
                ], 403);
            }
            return $next($request);
        }
        
        $validationRules = [
            'customer_email' => 'required|email',
            'invoice_number' => 'required|string|max:50',
        ];
        
        $validator = Validator::make($request->all(), $validationRules);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Order ownership verification required',
                'errors' => [
                    'verification' => ['Guest users must provide customer_email and invoice_number'],
                    'validation' => $validator->errors(),
                ],
            ], 422);
        }
        
        if ($order->customer_email !== $request->customer_email || 
            $order->invoice_number !== $request->invoice_number) {
            return response()->json([
                'message' => 'Ownership verification failed',
                'errors' => [
                    'order' => ['The provided credentials do not match this order'],
                ],
            ], 403);
        }
        
        return $next($request);
    }
}

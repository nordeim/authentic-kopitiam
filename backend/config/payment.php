<?php

return [
    "stripe" => [
        "publishable_key" => env("STRIPE_KEY"),
        "secret_key" => env("STRIPE_SECRET"),
        "webhook_secret" => env("STRIPE_WEBHOOK_SECRET"),
        "currency" => env("STRIPE_CURRENCY", "SGD"),
        "mode" => env("STRIPE_MODE", "test"),
        "version" => env("STRIPE_VERSION", "2024-04-10"),
    ],
    "paynow" => [
        "uen" => env("PAYNOW_UEN"),
        "api_key" => env("PAYNOW_API_KEY"),
        "api_secret" => env("PAYNOW_API_SECRET"),
        "api_url" => env("PAYNOW_API_URL", "https://api.paynow.com"),
        "mode" => env("PAYNOW_MODE", "test"),
    ],
    "default_currency" => env("PAYMENT_CURRENCY", "SGD"),
    "webhook_urls" => [
        "stripe" => env("APP_URL") . "/api/webhooks/stripe",
        "paynow" => env("APP_URL") . "/api/webhooks/paynow",
    ],
];

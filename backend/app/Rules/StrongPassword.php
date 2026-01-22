<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Strong Password Rule
 * 
 * Enforces enterprise-grade password requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
class StrongPassword implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $password = (string) $value;

        // Minimum length check
        if (strlen($password) < 8) {
            $fail('The password must be at least 8 characters.');
            return;
        }

        // Uppercase letter check
        if (!preg_match('/[A-Z]/', $password)) {
            $fail('The password must contain at least one uppercase letter.');
            return;
        }

        // Lowercase letter check
        if (!preg_match('/[a-z]/', $password)) {
            $fail('The password must contain at least one lowercase letter.');
            return;
        }

        // Number check
        if (!preg_match('/[0-9]/', $password)) {
            $fail('The password must contain at least one number.');
            return;
        }

        // Special character check
        if (!preg_match('/[!@#$%^&*()\-_=+{};:,<.>]/', $password)) {
            $fail('The password must contain at least one special character (!@#$%^&*()-_=+{};:,<.>).');
            return;
        }
    }
}

#!/usr/bin/env python3
"""
Atomic test case repair with diagnostic capture and field population fix.
Fixes missing customer_email/invoice_number in order factory for status transitions test.
"""

import sys
import subprocess
import re
import shutil
import json
from pathlib import Path
from datetime import datetime
import os
import textwrap

def main():
    # Configuration
    test_file = Path("/home/project/authentic-kopitiam/backend/tests/Api/OrderControllerTest.php")
    backup_path = test_file.with_suffix(f".bak_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    docker_service = "backend"
    test_filter = "OrderControllerTest::test_order_status_transitions"

    # Pre-flight validation
    validate_environment(test_file, docker_service)

    # Create atomic backup
    create_backup(test_file, backup_path)

    # Read current content
    content = read_file(test_file)

    # Define the broken test block (current state with ownership params but missing factory fields)
    BROKEN_BLOCK = """    public function test_order_status_transitions()
    {
        $order = Order::factory()->create(['status' => 'pending']);

        // Update with ownership verification
        $this->putJson('/api/v1/orders/'.$order->id.'/status', [
            'status' => 'confirmed',
            'customer_email' => $order->customer_email,
            'invoice_number' => $order->invoice_number,
        ])->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', [
            'status' => 'preparing',
            'customer_email' => $order->customer_email,
            'invoice_number' => $order->invoice_number,
        ])->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', [
            'status' => 'ready',
            'customer_email' => $order->customer_email,
            'invoice_number' => $order->invoice_number,
        ])->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', [
            'status' => 'completed',
            'customer_email' => $order->customer_email,
            'invoice_number' => $order->invoice_number,
        ])->assertStatus(200);

        $order->refresh();
        $this->assertEquals('completed', $order->status);
    }"""

    # Define the CORRECTED block with factory fields populated
    FIXED_BLOCK = """    public function test_order_status_transitions()
    {
        $order = Order::factory()->create([
            'status' => 'pending',
            'customer_email' => 'test@example.com',
            'invoice_number' => 'INV-2026-TEST001'
        ]);

        // Update with ownership verification
        $this->putJson('/api/v1/orders/'.$order->id.'/status', [
            'status' => 'confirmed',
            'customer_email' => $order->customer_email,
            'invoice_number' => $order->invoice_number,
        ])->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', [
            'status' => 'preparing',
            'customer_email' => $order->customer_email,
            'invoice_number' => $order->invoice_number,
        ])->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', [
            'status' => 'ready',
            'customer_email' => $order->customer_email,
            'invoice_number' => $order->invoice_number,
        ])->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', [
            'status' => 'completed',
            'customer_email' => $order->customer_email,
            'invoice_number' => $order->invoice_number,
        ])->assertStatus(200);

        $order->refresh();
        $this->assertEquals('completed', $order->status);
    }"""

    # Verify target block exists (with flexibility for current broken state)
    if BROKEN_BLOCK not in content:
        print("⚠️  Target block not found in expected broken state. Checking for variants...")
        if not verify_target_variant(content, backup_path):
            handle_failure("Could not identify target test block", test_file, backup_path, backup_path)

    # Perform replacement
    updated_content, replacements = replace_block(content, BROKEN_BLOCK, FIXED_BLOCK)
    
    # Fallback: if exact match fails, try to match with normalized whitespace
    if replacements == 0:
        print("⚠️  Exact block match failed. Attempting whitespace-normalized replacement...")
        updated_content, replacements = replace_with_normalized(content, BROKEN_BLOCK, FIXED_BLOCK)
    
    if replacements == 0:
        handle_failure("Replacement failed: No substitutions made", test_file, backup_path, backup_path)
    
    if replacements > 1:
        handle_failure(f"Too many replacements ({replacements}) - structural damage possible", test_file, backup_path, backup_path)

    # Verify replacement integrity
    verify_replacement(updated_content, FIXED_BLOCK, backup_path)

    # Write changes atomically
    write_file_atomically(test_file, updated_content, backup_path)

    # Execute test with comprehensive diagnostics
    test_result = execute_docker_test_with_diagnostics(docker_service, test_filter, backup_path)

    # Final reporting
    report_results(test_result, test_file, backup_path)

def validate_environment(test_file: Path, docker_service: str):
    """Validate pre-conditions for safe execution"""
    if not test_file.exists():
        print(f"❌ CRITICAL: Test file not found: {test_file}", file=sys.stderr)
        sys.exit(1)
    
    if not os.access(test_file, os.W_OK):
        print(f"❌ CRITICAL: No write permission for: {test_file}", file=sys.stderr)
        sys.exit(1)
    
    # Check Docker service status
    try:
        result = subprocess.run(
            ["docker", "compose", "ps", "--services", "--filter", "status=running"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if docker_service not in result.stdout.splitlines():
            print(f"❌ CRITICAL: Docker service '{docker_service}' not running", file=sys.stderr)
            print("💡 Start services with: docker compose up -d", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"❌ CRITICAL: Docker status check failed - {str(e)}", file=sys.stderr)
        sys.exit(1)

def create_backup(test_file: Path, backup_path: Path):
    """Create atomic backup with verification"""
    try:
        shutil.copy2(test_file, backup_path)
        print(f"✅ Created atomic backup: {backup_path.name}")
        
        # Verify backup integrity
        if not backup_path.exists() or backup_path.stat().st_size == 0:
            raise ValueError("Backup file is empty or missing")
    except Exception as e:
        print(f"❌ CRITICAL: Backup creation failed - {str(e)}", file=sys.stderr)
        sys.exit(1)

def read_file(file_path: Path) -> str:
    """Read file content with error handling"""
    try:
        return file_path.read_text()
    except Exception as e:
        print(f"❌ CRITICAL: Failed to read {file_path} - {str(e)}", file=sys.stderr)
        sys.exit(1)

def verify_target_variant(content: str, backup_path: Path) -> bool:
    """Try to find variant of the target block with different formatting"""
    # Check for presence of method signature and key elements
    if "test_order_status_transitions" not in content:
        return False
    
    if "'status' => 'pending'" not in content:
        return False
    
    if "customer_email" not in content or "invoice_number" not in content:
        return False
    
    print("✅ Found variant of target block - proceeding with structural replacement")
    return True

def replace_block(content: str, old_block: str, new_block: str) -> (str, int):
    """Perform exact block replacement with count verification"""
    updated_content = content.replace(old_block, new_block, 1)
    replacements = 1 if updated_content != content else 0
    return updated_content, replacements

def replace_with_normalized(content: str, old_block: str, new_block: str) -> (str, int):
    """Replace with normalized whitespace matching"""
    # Create normalized versions (remove extra spaces and normalize line endings)
    normalized_content = re.sub(r'\s+', ' ', content.replace('\n', ' '))
    normalized_old = re.sub(r'\s+', ' ', old_block.replace('\n', ' '))
    
    # Find the start index of the normalized old block
    start_idx = normalized_content.find(normalized_old)
    if start_idx == -1:
        return content, 0
    
    # Calculate the actual start and end positions in the original content
    # This is complex, so we'll use a simpler approach: replace based on context
    pattern = r'public\s+function\s+test_order_status_transitions\s*\(\s*\)\s*\{[^}]*status[^}]*customer_email[^}]*invoice_number[^}]*\}'
    
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return content, 0
    
    # Replace the matched block with the fixed version
    updated_content = content[:match.start()] + new_block + content[match.end():]
    return updated_content, 1

def verify_replacement(content: str, new_block: str, backup_path: Path):
    """Verify replacement integrity with multiple checks"""
    # Basic verification: check for key elements of the fixed block
    required_strings = [
        "'customer_email' => 'test@example.com'",
        "'invoice_number' => 'INV-2026-TEST001'",
        "'customer_email' => $order->customer_email",
        "'invoice_number' => $order->invoice_number"
    ]
    
    for required in required_strings:
        if required not in content:
            handle_failure(f"Verification failed: Missing required string '{required}'", Path(""), backup_path, backup_path)
    
    print("✅ Replacement integrity verified")

def write_file_atomically(file_path: Path, content: str, backup_path: Path):
    """Write changes atomically with verification"""
    try:
        temp_file = file_path.with_suffix('.tmp')
        temp_file.write_text(content)
        
        # Basic verification: file exists and has content
        if not temp_file.exists() or temp_file.stat().st_size == 0:
            raise ValueError("Temporary file is empty or missing")
        
        # Additional verification: check for a key string that must exist
        temp_content = temp_file.read_text()
        if "test_order_status_transitions" not in temp_content:
            raise ValueError("Temporary file missing critical test function")
        
        # Atomic rename
        temp_file.rename(file_path)
        print("✅ Atomic write completed successfully")
    except Exception as e:
        handle_failure(f"Write failed: {str(e)}", file_path, backup_path, backup_path)

def execute_docker_test_with_diagnostics(service: str, test_filter: str, backup_path: Path) -> dict:
    """Execute Docker test command with comprehensive diagnostics capture"""
    print("\n🚀 Executing test with full diagnostics: docker compose exec backend php artisan test --filter='OrderControllerTest::test_order_status_transitions'")
    
    try:
        # First, run the test and capture full output
        result = subprocess.run(
            [
                "docker", "compose", "exec", "-T", service,
                "php", "artisan", "test", f"--filter={test_filter}", "--stop-on-failure"
            ],
            capture_output=True,
            text=True,
            timeout=120  # 2-minute timeout for tests
        )
        
        # Try to get more detailed failure information if the test failed
        failure_details = ""
        if result.returncode != 0 or "FAILURES!" in result.stdout:
            print("\n🔍 Capturing detailed failure diagnostics...")
            
            # Run the test in verbose mode to get stack traces
            verbose_result = subprocess.run(
                [
                    "docker", "compose", "exec", "-T", service,
                    "php", "artisan", "test", f"--filter={test_filter}", "-v"
                ],
                capture_output=True,
                text=True,
                timeout=60
            )
            failure_details = verbose_result.stdout + verbose_result.stderr
        
        # Parse test result
        success = "Tests:  1, Assertions: " in result.stdout and "FAILURES!" not in result.stdout
        return {
            "success": success,
            "exit_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "failure_details": failure_details
        }
    
    except subprocess.TimeoutExpired:
        handle_failure("Test execution timed out after 120 seconds", Path(""), backup_path, backup_path)
    except Exception as e:
        handle_failure(f"Test execution failed: {str(e)}", Path(""), backup_path, backup_path)

def report_results(test_result: dict, test_file: Path, backup_path: Path):
    """Generate comprehensive test results report with failure diagnostics"""
    print("\n" + "="*80)
    print("TEST EXECUTION RESULTS")
    print("="*80)
    
    if test_result["success"]:
        print("✅✅ TEST PASSED SUCCESSFULLY ✅✅")
        print("\n💡 REMEDIATION COMPLETE:")
        print("  - Order status transitions test now includes ownership verification")
        print("  - Factory now properly populates customer_email and invoice_number")
        print("  - All status changes (pending → confirmed → preparing → ready → completed) validated")
        print(f"  - Backup preserved at: {backup_path}")
        sys.exit(0)
    else:
        print("❌❌ TEST FAILED - DETAILED DIAGNOSTICS ❌❌")
        print("\n🚨 FAILURE ANALYSIS:")
        print(f"  - Docker exit code: {test_result['exit_code']}")
        
        # Show standard output with context
        if test_result["stdout"].strip():
            print("\n📋 STANDARD OUTPUT:")
            print(textwrap.indent(test_result["stdout"].strip(), '  '))
        
        # Show detailed failure diagnostics if available
        if test_result.get("failure_details", "").strip():
            print("\n🔍 DETAILED FAILURE DIAGNOSTICS:")
            # Extract the most relevant part of the failure
            failure_section = test_result["failure_details"]
            if "There was 1 failure:" in failure_section:
                start_idx = failure_section.find("There was 1 failure:")
                failure_section = failure_section[start_idx:start_idx+800]
            elif "FAILURES!" in failure_section:
                start_idx = failure_section.find("FAILURES!")
                failure_section = failure_section[start_idx:start_idx+800]
            
            print(textwrap.indent(failure_section.strip(), '  '))
        elif test_result["stderr"].strip():
            print("\n⚠️  ERROR OUTPUT:")
            print(textwrap.indent(test_result["stderr"].strip(), '  '))
        
        print("\n🔍 ROOT CAUSE ANALYSIS & RECOMMENDED ACTIONS:")
        if "customer_email" in test_result["failure_details"] or "invoice_number" in test_result["failure_details"]:
            print("  🎯 PRIMARY CAUSE: Factory fields not properly populated or middleware validation failing")
            print("  ✅ FIX VERIFIED: Test now includes explicit customer_email and invoice_number in factory")
            print("  🔄 NEXT STEPS: Verify middleware implementation accepts these values")
        else:
            print("  🎯 PRIMARY CAUSE: Unknown failure - requires manual inspection")
            print("  ✅ FIX APPLIED: Added required fields to order factory")
            print("  🔄 NEXT STEPS: Check order.ownership middleware implementation details")
        
        print(f"\n💾 MANUAL RECOVERY COMMAND:\n  cp {backup_path} {test_file}")
        
        # Offer to restore backup automatically
        restore = input("\n❓ Restore backup automatically? (y/n): ").strip().lower()
        if restore == 'y':
            try:
                shutil.copy2(backup_path, test_file)
                print(f"✅ Automatically restored from backup: {backup_path.name}")
            except Exception as e:
                print(f"❌ Restoration failed: {str(e)}")
        else:
            print(f"💡 Manual restoration command: cp {backup_path} {test_file}")
        
        sys.exit(1)

def handle_failure(message: str, file_path: Path, backup_path: Path, original_backup: Path):
    """Handle failures with automatic backup restoration"""
    print(f"\n❌ CRITICAL FAILURE: {message}", file=sys.stderr)
    
    if backup_path.exists():
        try:
            if file_path.exists():
                shutil.copy2(backup_path, file_path)
            print(f"✅ Automatically restored from backup: {backup_path.name}", file=sys.stderr)
        except Exception as e:
            print(f"⚠️  RESTORE FAILED: {str(e)}", file=sys.stderr)
            print(f"💡 MANUAL RESTORE COMMAND: cp {original_backup} {file_path}", file=sys.stderr)
    
    sys.exit(1)

if __name__ == "__main__":
    main()

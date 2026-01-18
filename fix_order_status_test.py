#!/usr/bin/env python3
"""
Atomic test case update with structural verification and Docker test execution.
Safely replaces the order status transitions test with ownership verification parameters.
"""

import sys
import subprocess
import re
import shutil
from pathlib import Path
from datetime import datetime
import os

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

    # Define exact replacement blocks (preserving original formatting)
    OLD_BLOCK = """    public function test_order_status_transitions()
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', ['status' => 'confirmed'])
            ->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', ['status' => 'preparing'])
            ->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', ['status' => 'ready'])
            ->assertStatus(200);

        $this->putJson('/api/v1/orders/'.$order->id.'/status', ['status' => 'completed'])
            ->assertStatus(200);

        $order->refresh();
        $this->assertEquals('completed', $order->status);
    }"""

    NEW_BLOCK = """    public function test_order_status_transitions()
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

    # Verify target block exists before replacement
    verify_target_exists(content, OLD_BLOCK, backup_path)

    # Perform replacement with exact match count verification
    updated_content, replacements = replace_block(content, OLD_BLOCK, NEW_BLOCK)
    if replacements == 0:
        handle_failure("Replacement failed: No substitutions made", test_file, backup_path, backup_path)
    
    if replacements > 1:
        handle_failure(f"Too many replacements ({replacements}) - structural damage possible", test_file, backup_path, backup_path)

    # Verify replacement integrity
    verify_replacement(updated_content, NEW_BLOCK, backup_path)

    # Write changes atomically
    write_file_atomically(test_file, updated_content, backup_path)

    # Execute test with timeout and capture output
    test_result = execute_docker_test(docker_service, test_filter, backup_path)

    # Final verification and reporting
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

def verify_target_exists(content: str, old_block: str, backup_path: Path):
    """Verify target block exists with structural context awareness"""
    if old_block in content:
        print("✅ Target test block found - proceeding with replacement")
        return
    
    # Fallback: Check for structural variants with normalized whitespace
    normalized_content = re.sub(r'\s+', ' ', content.replace('\n', ' '))
    normalized_old = re.sub(r'\s+', ' ', old_block.replace('\n', ' '))
    
    if normalized_old in normalized_content:
        print("⚠️  Target block found with whitespace variations - proceeding with caution")
        return
    
    # Detailed diagnostics for missing block
    print("❌ CRITICAL: Target test block NOT FOUND in file", file=sys.stderr)
    print("\n💡 DIAGNOSTICS:", file=sys.stderr)
    print(f"  - Expected block signature: '{old_block[:50].strip()}...'", file=sys.stderr)
    print(f"  - File size: {len(content)} bytes", file=sys.stderr)
    print(f"  - First 100 chars: '{content[:100]}'", file=sys.stderr)
    
    # Show nearby context if possible
    try:
        start_idx = content.lower().find("test_order_status_transitions")
        if start_idx != -1:
            context_start = max(0, start_idx - 100)
            context_end = min(len(content), start_idx + 300)
            print(f"\n💡 CONTEXT AROUND 'test_order_status_transitions':", file=sys.stderr)
            print(f"{content[context_start:context_end]}", file=sys.stderr)
    except Exception:
        pass
    
    handle_failure("Target block verification failed", Path(""), backup_path, backup_path)

def replace_block(content: str, old_block: str, new_block: str) -> (str, int):
    """Perform exact block replacement with count verification"""
    updated_content = content.replace(old_block, new_block, 1)
    replacements = 1 if updated_content != content else 0
    return updated_content, replacements

def verify_replacement(content: str, new_block: str, backup_path: Path):
    """Verify replacement integrity with multiple checks"""
    if new_block not in content:
        handle_failure("Verification failed: New block not found in content", Path(""), backup_path, backup_path)
    
    # Check for ownership verification parameters
    if "'customer_email' => $order->customer_email" not in content:
        handle_failure("Verification failed: Missing customer_email parameter", Path(""), backup_path, backup_path)
    
    if "'invoice_number' => $order->invoice_number" not in content:
        handle_failure("Verification failed: Missing invoice_number parameter", Path(""), backup_path, backup_path)
    
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

def execute_docker_test(service: str, test_filter: str, backup_path: Path) -> dict:
    """Execute Docker test command with timeout and output capture"""
    print("\n🚀 Executing test: docker compose exec backend php artisan test --filter='OrderControllerTest::test_order_status_transitions'")
    
    try:
        result = subprocess.run(
            [
                "docker", "compose", "exec", "-T", service,
                "php", "artisan", "test", f"--filter={test_filter}"
            ],
            capture_output=True,
            text=True,
            timeout=120  # 2-minute timeout for tests
        )
        
        # Parse test result
        success = "Tests:  1, Assertions: " in result.stdout and "FAILURES!" not in result.stdout
        return {
            "success": success,
            "exit_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr
        }
    
    except subprocess.TimeoutExpired:
        handle_failure("Test execution timed out after 120 seconds", Path(""), backup_path, backup_path)
    except Exception as e:
        handle_failure(f"Test execution failed: {str(e)}", Path(""), backup_path, backup_path)

def report_results(test_result: dict, test_file: Path, backup_path: Path):
    """Generate comprehensive test results report"""
    print("\n" + "="*80)
    print("TEST EXECUTION RESULTS")
    print("="*80)
    
    if test_result["success"]:
        print("✅✅ TEST PASSED SUCCESSFULLY ✅✅")
        print("\n💡 REMEDIATION COMPLETE:")
        print("  - Order status transitions test now includes ownership verification")
        print("  - All status changes (pending → confirmed → preparing → ready → completed) validated")
        print(f"  - Backup preserved at: {backup_path}")
        sys.exit(0)
    else:
        print("❌❌ TEST FAILED - INVESTIGATION REQUIRED ❌❌")
        print("\n🚨 FAILURE ANALYSIS:")
        print(f"  - Docker exit code: {test_result['exit_code']}")
        print(f"  - Error output: {test_result['stderr'].strip() or 'None'}")
        
        # Extract relevant failure details
        failure_section = ""
        if "FAILURES!" in test_result["stdout"]:
            start_idx = test_result["stdout"].find("FAILURES!")
            failure_section = test_result["stdout"][start_idx:start_idx+500]
        
        print(f"\n💡 FAILURE CONTEXT:\n{failure_section}")
        print("\n🔍 RECOMMENDED ACTIONS:")
        print("  1. Check order.ownership middleware implementation")
        print("  2. Verify $order->customer_email and $order->invoice_number are populated")
        print("  3. Inspect InventoryService for rollback triggers")
        print(f"  4. Manual recovery: cp {backup_path} {test_file}")
        
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

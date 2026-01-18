#!/usr/bin/env python3
"""
Atomic route middleware replacement with structural integrity verification.
Safely replaces auth:sanctum with order.ownership middleware while preserving route group structure.
"""

import re
import sys
from pathlib import Path
import datetime
import shutil
import json

def main():
    # Configuration
    file_path = Path("/home/project/authentic-kopitiam/backend/routes/api.php")
    backup_path = file_path.with_suffix(f".structure_safe_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}")
    
    # Pre-flight validation
    if not file_path.exists():
        print(f"❌ ERROR: Route file not found at {file_path}", file=sys.stderr)
        sys.exit(1)
    
    if not file_path.is_file():
        print(f"❌ ERROR: Path is not a file: {file_path}", file=sys.stderr)
        sys.exit(1)
    
    # Create atomic backup
    try:
        shutil.copy2(file_path, backup_path)
        print(f"✅ Created structural backup: {backup_path.name}")
    except Exception as e:
        print(f"❌ CRITICAL: Backup failed - {str(e)}", file=sys.stderr)
        sys.exit(1)
    
    # Read file content
    try:
        content = file_path.read_text()
    except Exception as e:
        print(f"❌ ERROR: Failed to read file - {str(e)}", file=sys.stderr)
        restore_backup(file_path, backup_path)
        sys.exit(1)
    
    # Structural integrity checks before modification
    structure_errors = verify_route_structure(content)
    if structure_errors:
        print("❌ STRUCTURAL INTEGRITY VIOLATION DETECTED:", file=sys.stderr)
        for error in structure_errors:
            print(f"  - {error}", file=sys.stderr)
        print("\n💡 MANUAL INTERVENTION REQUIRED: Route group nesting is broken.", file=sys.stderr)
        print(f"💡 Restore from backup: {backup_path}", file=sys.stderr)
        sys.exit(1)
    
    # Target pattern with structural context awareness
    target_pattern = r"""Route::put\('orders/\{id\}/status',\s*OrderController::class,\s*'updateStatus'\)\s*\n\s*->middleware\('auth:sanctum'\);"""
    replacement = """  Route::put('orders/{id}/status', OrderController::class, 'updateStatus')\n    ->middleware('order.ownership');"""
    
    # Verify target exists BEFORE modification
    if not re.search(target_pattern, content, re.MULTILINE):
        print("❌ TARGET NOT FOUND: Route middleware pattern missing", file=sys.stderr)
        print("💡 Possible causes:", file=sys.stderr)
        print("  - Route already uses different middleware", file=sys.stderr)
        print("  - Route structure changed significantly", file=sys.stderr)
        print(f"💡 Restore from backup: {backup_path}", file=sys.stderr)
        restore_backup(file_path, backup_path)
        sys.exit(1)
    
    # Perform replacement with exact match count verification
    new_content, count = re.subn(target_pattern, replacement, content, count=1, flags=re.MULTILINE)
    
    if count == 0:
        print("❌ REPLACEMENT FAILED: No substitutions made", file=sys.stderr)
        restore_backup(file_path, backup_path)
        sys.exit(1)
    
    # Post-replacement structural verification
    new_structure_errors = verify_route_structure(new_content)
    if new_structure_errors:
        print("❌ STRUCTURAL INTEGRITY COMPROMISED AFTER REPLACEMENT:", file=sys.stderr)
        for error in new_structure_errors:
            print(f"  - {error}", file=sys.stderr)
        restore_backup(file_path, backup_path)
        sys.exit(1)
    
    # Atomic write with verification
    try:
        temp_path = file_path.with_suffix('.tmp')
        temp_path.write_text(new_content)
        
        # Final verification on temp file
        temp_content = temp_path.read_text()
        if not re.search(target_pattern.replace('auth:sanctum', 'order.ownership'), temp_content, re.MULTILINE):
            raise ValueError("Verification failed on temporary file")
        
        # Atomic rename
        temp_path.rename(file_path)
        print("✅ Atomic write completed successfully")
    except Exception as e:
        print(f"❌ WRITE FAILURE: {str(e)}", file=sys.stderr)
        restore_backup(file_path, backup_path)
        sys.exit(1)
    
    # Final validation
    try:
        final_content = file_path.read_text()
        if re.search(target_pattern, final_content, re.MULTILINE):
            raise ValueError("Original middleware pattern still exists")
        
        if not re.search(replacement, final_content, re.MULTILINE):
            raise ValueError("Replacement pattern not found in final content")
        
        print("✅✅ STRUCTURAL INTEGRITY VERIFIED ✅✅")
        print("Route middleware successfully updated with preserved group structure")
        print(f"Backup preserved at: {backup_path}")
        sys.exit(0)
    
    except Exception as e:
        print(f"❌ FINAL VERIFICATION FAILED: {str(e)}", file=sys.stderr)
        restore_backup(file_path, backup_path)
        sys.exit(1)

def verify_route_structure(content: str) -> list:
    """Verify route group nesting integrity with detailed diagnostics"""
    errors = []
    
    # Check v1 prefix group closure
    v1_group_start = content.count("Route::prefix('v1')->group(function () {")
    v1_group_end = content.count("})->middleware(['throttle:api', 'cors']);")
    
    if v1_group_start != v1_group_end:
        errors.append(f"v1 group imbalance: {v1_group_start} openings vs {v1_group_end} closings")
    
    # Check for orphaned routes outside groups
    orphaned_routes = re.findall(r"Route::(get|post|put|delete)\('/[^v]", content)
    if orphaned_routes:
        errors.append(f"Orphaned routes detected: {len(orphaned_routes)} routes outside version groups")
    
    # Check middleware application consistency
    auth_routes = len(re.findall(r"->middleware\(\['auth:sanctum'\]\)", content))
    ownership_routes = len(re.findall(r"->middleware\(\['order.ownership'\]\)", content))
    
    if auth_routes < 5:  # Expected minimum based on route structure
        errors.append(f"Unexpected auth:sanctum count ({auth_routes} < 5) - possible structural damage")
    
    # Check health check placement
    health_check_pos = content.find("Route::get('health',")
    v1_close_pos = content.find("})->middleware(['throttle:api', 'cors']);")
    
    if health_check_pos > 0 and v1_close_pos > 0 and health_check_pos < v1_close_pos:
        errors.append("Health check route inside v1 group (should be outside)")
    
    return errors

def restore_backup(file_path: Path, backup_path: Path):
    """Restore backup with error handling"""
    try:
        shutil.copy2(backup_path, file_path)
        print(f"✅ Automatically restored from backup: {backup_path.name}", file=sys.stderr)
    except Exception as e:
        print(f"❌⚠️ CRITICAL RESTORE FAILURE: {str(e)}", file=sys.stderr)
        print(f"⚠️ MANUAL RECOVERY REQUIRED: cp {backup_path} {file_path}", file=sys.stderr)

if __name__ == "__main__":
    main()

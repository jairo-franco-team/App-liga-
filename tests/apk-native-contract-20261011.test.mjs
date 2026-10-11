import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const java=fs.readFileSync(new URL('../native/android/LigaNotificationsPlugin.java',import.meta.url),'utf8');
test('Android bridge exposes installation persistence and read-only permission check',()=>{
 assert.match(java,/public void getInstallationState\(PluginCall call\)/);
 assert.match(java,/firstInstallTime/);assert.match(java,/lastUpdateTime/);
 assert.match(java,/public void completeOnboarding\(PluginCall call\)/);
 assert.match(java,/public void checkPermission\(PluginCall call\)/);
});
test('Android permission and delivery check actual app and channel settings on old and new Android',()=>{
 assert.match(java,/areNotificationsEnabled\(\)/);
 assert.match(java,/getImportance\(\)\s*!=\s*NotificationManager\.IMPORTANCE_NONE/);
 assert.match(java,/call\.resolve\(permissionStatus\(\)\)/);
 assert.match(java,/public void openNotificationSettings\(PluginCall call\)/);
 assert.match(java,/private boolean canNotify[\s\S]*?notificationsAllowed\(\)/);
});

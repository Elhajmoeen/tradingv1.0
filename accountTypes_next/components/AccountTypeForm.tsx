import React from 'react';

type Props = {
  initial?: Partial<{ 
    name: string; 
    status: 'ACTIVE'|'DISABLED'; 
    settings: {
      blockNotifications?: boolean;
      allowedToTrade?: boolean;
      allowDeposit?: boolean;
      allowWithdraw?: boolean;
      tradeOut?: boolean;
      marginCall?: number;
    };
  }>;
  onSubmit: (data: { 
    name: string; 
    status?: 'ACTIVE'|'DISABLED'; 
    settings?: {
      blockNotifications?: boolean;
      allowedToTrade?: boolean;
      allowDeposit?: boolean;
      allowWithdraw?: boolean;
      tradeOut?: boolean;
      marginCall?: number;
    };
  }) => void;
  submitting?: boolean;
};

export default function AccountTypeForm({ initial, onSubmit, submitting }: Props) {
  // Form state
  const [name, setName] = React.useState(initial?.name ?? '');
  const [status, setStatus] = React.useState<'ACTIVE'|'DISABLED'>(initial?.status ?? 'ACTIVE');
  const [settings, setSettings] = React.useState({
    blockNotifications: initial?.settings?.blockNotifications ?? false,
    allowedToTrade: initial?.settings?.allowedToTrade ?? true,
    allowDeposit: initial?.settings?.allowDeposit ?? true,
    allowWithdraw: initial?.settings?.allowWithdraw ?? true,
    tradeOut: initial?.settings?.tradeOut ?? true,
    marginCall: initial?.settings?.marginCall ?? 80,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, status, settings });
  };

  const handleSettingChange = (key: string, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Basic Information Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between w-full pb-3">
              <h2 className="text-lg font-semibold text-gray-900 relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Basic Information
                <div className="absolute bottom-[-8px] left-0 h-0.5 w-12 bg-blue-600 rounded-full"></div>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  placeholder="e.g., Gold, VIP, Standard"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Type Settings Panel - exactly like the existing one */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between w-full pb-3">
              <h2 className="text-lg font-semibold text-gray-900 relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Account Type Defaults
                <div className="absolute bottom-[-8px] left-0 h-0.5 w-12 bg-blue-600 rounded-full"></div>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              
              {/* Block Notifications */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-r lg:border-b sm:border-r lg:border-r-0 sm:border-b lg:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Block Notifications:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <span className="text-sm text-gray-600 truncate flex-1" style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}>
                        {settings.blockNotifications ? 'true' : 'false'}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        checked={settings.blockNotifications}
                        onChange={(e) => handleSettingChange('blockNotifications', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Allowed to Trade */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-r lg:border-b sm:border-r-0 sm:border-b lg:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Allowed to Trade:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <span className="text-sm text-gray-600 truncate flex-1" style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}>
                        {settings.allowedToTrade ? 'true' : 'false'}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        checked={settings.allowedToTrade}
                        onChange={(e) => handleSettingChange('allowedToTrade', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Allow Deposit */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-r lg:border-b sm:border-r lg:border-r-0 sm:border-b lg:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Allow Deposit:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <span className="text-sm text-gray-600 truncate flex-1" style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}>
                        {settings.allowDeposit ? 'true' : 'false'}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        checked={settings.allowDeposit}
                        onChange={(e) => handleSettingChange('allowDeposit', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Allow Withdraw */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-b sm:border-r-0 sm:border-b lg:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Allow Withdraw:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <span className="text-sm text-gray-600 truncate flex-1" style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}>
                        {settings.allowWithdraw ? 'true' : 'false'}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        checked={settings.allowWithdraw}
                        onChange={(e) => handleSettingChange('allowWithdraw', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade Out */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-r lg:border-b sm:border-r-0 sm:border-b lg:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Trade Out:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <span className="text-sm text-gray-600 truncate flex-1" style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}>
                        {settings.tradeOut ? 'true' : 'false'}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded"
                        checked={settings.tradeOut}
                        onChange={(e) => handleSettingChange('tradeOut', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Margin Call */}
              <div className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors relative min-h-[60px] lg:border-r sm:border-r-0 sm:border-b-0 border-b" style={{ borderColor: 'rgb(229, 231, 235)' }}>
                <div className="flex items-center gap-2 flex-shrink-0 pr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="h-4 w-4 text-gray-500">
                    <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"></path>
                  </svg>
                  <span className="text-sm text-gray-700 truncate" style={{ fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}>Margin Call:</span>
                </div>
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full group">
                      <input
                        type="number"
                        className="text-sm text-gray-600 bg-transparent border-none focus:ring-0 p-0 flex-1"
                        style={{ fontWeight: 400, fontFamily: 'Poppins, sans-serif' }}
                        value={settings.marginCall}
                        onChange={(e) => handleSettingChange('marginCall', Number(e.target.value))}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty cells to maintain grid layout */}
              <div className="hidden sm:block lg:border-r sm:border-r-0" style={{ borderColor: 'rgb(229, 231, 235)' }}></div>
              <div className="hidden lg:block"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-end gap-3">
          <a 
            href="/management/trading/account-types" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-blue-300"
          >
            Cancel
          </a>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !name.trim()} 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Account Type'}
          </button>
        </div>
      </div>
    </div>
  );
}
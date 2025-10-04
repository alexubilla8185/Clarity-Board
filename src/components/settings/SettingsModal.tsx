import * as React from 'react';
import { UserSettings, AppData } from '../../types';
import Modal from '../ui/Modal';
import { ACCENT_COLORS } from '../../constants';
import Avatar from '../ui/Avatar';
import { DownloadIcon, UploadIcon, ExternalLinkIcon } from '../ui/Icons';
import { PRESET_AVATAR_COMPONENTS, PRESET_AVATAR_KEYS } from '../ui/PresetAvatars';
import { useToast } from '../../contexts/ToastContext';
import Input from '../ui/Input';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userSettings: UserSettings;
    setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
    onClearAllData: () => void;
    onInitiateDataImport: (data: { appData: AppData, userSettings: UserSettings }) => void;
    onExportData: () => void;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; id: string; 'aria-controls': string }> = ({ active, onClick, children, id, 'aria-controls': ariaControls }) => (
    <button
        role="tab"
        id={id}
        aria-controls={ariaControls}
        aria-selected={active}
        onClick={onClick}
        className={`px-4 py-2 border-b-2 transition-colors rounded-t-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary label-large ${
            active ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
        }`}
    >
        {children}
    </button>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, userSettings, setUserSettings, onClearAllData, onInitiateDataImport, onExportData }) => {
    const [activeTab, setActiveTab] = React.useState<'profile' | 'appearance' | 'data' | 'about'>('profile');
    const [name, setName] = React.useState(userSettings.name);
    const [isDeleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const avatarInputRef = React.useRef<HTMLInputElement>(null);
    const { showToast } = useToast();


    const handleNameBlur = () => {
        if (name.trim()) {
            setUserSettings(prev => ({...prev, name: name.trim()}));
        } else {
            setName(userSettings.name);
        }
    };
    
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserSettings(prev => ({...prev, avatar: { type: 'custom', value: reader.result as string }}));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target?.result as string);
                    // Basic validation
                    if (importedData.appData && importedData.userSettings) {
                        onInitiateDataImport(importedData);
                    } else {
                        showToast('Invalid backup file format.', 'error');
                    }
                } catch (error) {
                    showToast('Error reading or parsing the backup file.', 'error');
                }
            };
            reader.readAsText(file);
        }
        e.target.value = ''; // Reset file input
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirmation === 'DELETE') {
            onClearAllData();
            setDeleteModalOpen(false);
            onClose();
        }
    };

    // When the modal opens, sync the local name state with the global userSettings
    React.useEffect(() => {
        if(isOpen) {
            setName(userSettings.name);
        }
    }, [isOpen, userSettings.name])

    const tabs = ['profile', 'appearance', 'data', 'about'];

    return (
        <>
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
            <div role="tablist" aria-label="Settings categories" className="flex border-b border-outline mb-6">
                {tabs.map(tab => (
                    <TabButton 
                        key={tab}
                        id={`tab-${tab}`}
                        aria-controls={`panel-${tab}`}
                        active={activeTab === tab} 
                        onClick={() => setActiveTab(tab as any)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </TabButton>
                ))}
            </div>
            
            {activeTab === 'profile' && (
                <div id="panel-profile" role="tabpanel" tabIndex={0} aria-labelledby="tab-profile" className="space-y-6 focus:outline-none">
                    <div>
                        <Input
                            id="display-name"
                            label="Display Name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={handleNameBlur}
                            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-on-surface-variant label-large">Avatar</label>
                        <div className="flex items-center gap-4">
                            <Avatar userSettings={userSettings} size="lg" />
                            <div className="flex flex-col gap-2">
                                <button onClick={() => avatarInputRef.current?.click()} className="h-10 px-6 rounded-full transition-all border border-outline text-on-surface hover:bg-outline/10 focus:outline-none focus:ring-4 focus:ring-primary/30 label-large">
                                    Upload Photo
                                </button>
                                <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" />
                                <button onClick={() => setUserSettings(p => ({...p, avatar: null}))} className="h-10 px-6 rounded-full text-error hover:bg-error/10 transition-colors focus:outline-none focus:ring-4 focus:ring-primary/30 label-large">
                                    Remove Photo
                                </button>
                            </div>
                        </div>
                         <div className="mt-4 grid grid-cols-6 gap-2">
                            {PRESET_AVATAR_KEYS.map(avatarKey => {
                                const AvatarComponent = PRESET_AVATAR_COMPONENTS[avatarKey];
                                return (
                                    <button key={avatarKey} onClick={() => setUserSettings(p => ({...p, avatar: {type: 'preset', value: avatarKey}}))}
                                        aria-label={`Select ${avatarKey} avatar`}
                                        className={`w-12 h-12 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-all focus:outline-none ${userSettings.avatar?.type === 'preset' && userSettings.avatar?.value === avatarKey ? 'ring-primary' : 'ring-transparent hover:ring-primary/50 focus:ring-primary/50'}`}>
                                        <AvatarComponent className="w-full h-full rounded-full" />
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'appearance' && (
                 <div id="panel-appearance" role="tabpanel" tabIndex={0} aria-labelledby="tab-appearance" className="space-y-6 focus:outline-none">
                    <div>
                        <label className="block mb-2 text-on-surface-variant label-large">Theme</label>
                        <div className="flex items-center bg-surface-container rounded-full p-1 w-fit">
                            {(['Light', 'Dark', 'True Dark', 'System'] as const).map(theme => (
                                <button key={theme} onClick={() => setUserSettings(p => ({...p, theme: theme.toLowerCase().replace(' ', '-') as UserSettings['theme']}))}
                                className={`h-8 px-3 rounded-full capitalize focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary label-large ${userSettings.theme === theme.toLowerCase().replace(' ', '-') ? 'bg-primary text-on-primary shadow-1' : 'text-on-surface-variant'}`}>
                                    {theme}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="block mb-2 text-on-surface-variant label-large">Accent Color</label>
                         <div className="flex gap-3">
                            {ACCENT_COLORS.map(color => (
                                <button key={color.name} onClick={() => setUserSettings(p => ({...p, accentColor: color.value}))} title={color.name}
                                aria-label={`Set accent color to ${color.name}`}
                                className={`w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-surface transition-all focus:outline-none ${userSettings.accentColor === color.value ? 'ring-primary' : 'ring-transparent focus:ring-primary'}`}
                                style={{backgroundColor: `rgb(${color.value})`}}></button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'data' && (
                 <div id="panel-data" role="tabpanel" tabIndex={0} aria-labelledby="tab-data" className="space-y-6 focus:outline-none">
                     <p className="text-on-surface-variant body-medium">Manage your app data. Backups include all projects, categories, and settings.</p>
                     <div className="flex gap-4">
                         <button onClick={onExportData} className="h-10 px-4 rounded-full flex-1 flex items-center justify-center gap-2 border border-outline text-on-surface hover:bg-outline/10 focus:outline-none focus:ring-4 focus:ring-primary/30 label-large">
                             <DownloadIcon className="w-5 h-5" /> Export to JSON
                         </button>
                         <button onClick={() => fileInputRef.current?.click()} className="h-10 px-4 rounded-full flex-1 flex items-center justify-center gap-2 border border-outline text-on-surface hover:bg-outline/10 focus:outline-none focus:ring-4 focus:ring-primary/30 label-large">
                            <UploadIcon className="w-5 h-5" /> Import from JSON
                         </button>
                         <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />
                     </div>
                     <div className="border-t border-error/30 my-6"></div>
                     <div className="p-4 rounded-lg border-2 border-dashed border-error bg-error/10 text-on-error">
                         <h3 className="text-error title-large">Danger Zone</h3>
                         <p className="mt-1 mb-4 body-medium">This action cannot be undone. All your projects, categories, and settings will be permanently deleted.</p>
                         <button onClick={() => setDeleteModalOpen(true)} className="h-10 px-6 rounded-full bg-error hover:brightness-90 text-on-error transition-colors focus:outline-none focus:ring-4 focus:ring-on-error/50 label-large">
                             Clear All Data
                         </button>
                     </div>
                 </div>
            )}
            {activeTab === 'about' && (
                 <div id="panel-about" role="tabpanel" tabIndex={0} aria-labelledby="tab-about" className="space-y-4 text-on-surface-variant focus:outline-none body-medium">
                    <h2 className="text-on-surface headline-small">About Clarity Board</h2>
                    <p><strong>Version:</strong> 1.3.0</p>
                    <p><strong>Developer:</strong> <a href="https://tekguyz.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 w-fit rounded-sm focus:outline-none focus:ring-2 focus:ring-primary">TEKGUYZ <ExternalLinkIcon className="w-4 h-4" /></a></p>
                    <div className="pt-2">
                        <h3 className="text-on-surface mb-1 title-large">Privacy Statement</h3>
                        <p>Clarity Board is a privacy-first application. All your data is stored exclusively in your browser on your device using IndexedDB and is never sent to our servers. Only the AI feature sends text to Google when you choose to use it.</p>
                    </div>
                     <div className="pt-2">
                        <h3 className="text-on-surface mb-1 title-large">Legal</h3>
                        <div className="flex gap-4">
                            <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline rounded-sm focus:outline-none focus:ring-2 focus:ring-primary">Privacy Policy</a>
                            <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline rounded-sm focus:outline-none focus:ring-2 focus:ring-primary">Terms of Service</a>
                        </div>
                    </div>
                 </div>
            )}
        </Modal>

        <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Are you absolutely sure?">
            <div className="space-y-4">
                <p className="text-on-surface-variant body-large">This action is irreversible. To confirm, please type <strong className="text-on-surface">DELETE</strong> below.</p>
                <Input
                    label="Type DELETE to confirm"
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="border-error focus:border-error"
                />
                 <button 
                    onClick={handleDeleteConfirm} 
                    disabled={deleteConfirmation !== 'DELETE'}
                    className="w-full h-10 px-6 rounded-full bg-error text-on-error transition-colors disabled:bg-error/50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-on-error/50 label-large">
                     I understand the consequences, delete everything
                 </button>
            </div>
        </Modal>
        </>
    );
};

export default SettingsModal;

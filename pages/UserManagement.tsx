
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRole, StoreUser, UserPermission } from '../types';
import { useLanguage } from '../App';

const UserManagement: React.FC = () => {
  const { t, lang } = useLanguage();
  const [users, setUsers] = useState<StoreUser[]>([
    {
      id: '1',
      name: lang === 'ar' ? 'أمين بن سالم' : 'Amine Ben Salem',
      email: 'amine@store.dz',
      role: UserRole.OWNER,
      location: lang === 'ar' ? 'الجزائر الوسطى' : 'Algiers Center',
      status: 'ACTIVE',
      lastActive: lang === 'ar' ? 'الآن' : 'Now'
    },
    {
      id: '2',
      name: lang === 'ar' ? 'سارة مراد' : 'Sara Murad',
      email: 'sara@store.dz',
      role: UserRole.MANAGER,
      location: lang === 'ar' ? 'باب الزوار' : 'Bab Ezzouar',
      status: 'ACTIVE',
      lastActive: lang === 'ar' ? 'منذ ساعتين' : '2 hours ago'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: UserRole.SECURITY,
    location: lang === 'ar' ? 'الجزائر الوسطى' : 'Algiers Center'
  });

  const getRolePermissions = (role: UserRole): UserPermission => {
    switch (role) {
      case UserRole.OWNER:
        return { canViewLive: true, canViewIncidents: true, canExportReports: true, canManageUsers: true, canEditSettings: true };
      case UserRole.MANAGER:
        return { canViewLive: true, canViewIncidents: true, canExportReports: true, canManageUsers: false, canEditSettings: false };
      case UserRole.SECURITY:
        return { canViewLive: true, canViewIncidents: false, canExportReports: false, canManageUsers: false, canEditSettings: false };
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: StoreUser = {
      ...newUser,
      id: Date.now().toString(),
      status: 'ACTIVE',
      lastActive: lang === 'ar' ? 'الآن' : 'Now'
    };
    setUsers([...users, user]);
    setIsModalOpen(false);
    setNewUser({ name: '', email: '', role: UserRole.SECURITY, location: lang === 'ar' ? 'الجزائر الوسطى' : 'Algiers Center' });
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="p-10 bg-[#F9F7FF] min-h-screen font-['Cairo']" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#100821]/80 backdrop-blur-md">
          <div className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-2xl border border-violet-100">
            <h2 className="text-3xl font-black text-slate-900 mb-8">{t.userManagement.modal.title}</h2>
            <form onSubmit={handleAddUser} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">{t.userManagement.modal.name}</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#7B2CF6]"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">{t.userManagement.modal.email}</label>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#7B2CF6]"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">{t.userManagement.modal.role}</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#7B2CF6]"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                  >
                    <option value={UserRole.SECURITY}>{t.userManagement.modal.roles.SECURITY}</option>
                    <option value={UserRole.MANAGER}>{t.userManagement.modal.roles.MANAGER}</option>
                    <option value={UserRole.OWNER}>{t.userManagement.modal.roles.OWNER}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">{t.userManagement.modal.location}</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#7B2CF6]"
                    value={newUser.location}
                    onChange={(e) => setNewUser({...newUser, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-violet-50 p-6 rounded-3xl border border-violet-100">
                 <h4 className="text-xs font-black text-[#7B2CF6] uppercase tracking-widest mb-4">{t.userManagement.modal.permsTitle}</h4>
                 <div className="grid grid-cols-2 gap-4">
                    {Object.entries(getRolePermissions(newUser.role)).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <i className={`fas ${value ? 'fa-check-circle text-green-500' : 'fa-times-circle text-slate-300'} text-sm`}></i>
                        <span className="text-xs font-bold text-slate-600">
                          {t.userManagement.modal.perms[key.replace('can', '').charAt(0).toLowerCase() + key.replace('can', '').slice(1).toLowerCase() as keyof typeof t.userManagement.modal.perms]}
                        </span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-5 bg-[#7B2CF6] text-white rounded-2xl font-black shadow-xl shadow-violet-200 hover:bg-[#8B5CF6] transition-all">{t.userManagement.modal.confirm}</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black">{t.userManagement.modal.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <div className="flex items-center gap-4 mb-3">
               <span className="px-3 py-1 bg-[#7B2CF6] text-white text-[9px] font-black rounded-lg">MANAGEMENT</span>
               <h1 className="text-4xl font-black text-slate-900">{t.userManagement.title}</h1>
            </div>
            <p className="text-slate-400 font-bold text-sm">{t.userManagement.desc}</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-5 bg-[#7B2CF6] text-white rounded-[28px] font-black shadow-xl shadow-violet-200 hover:bg-[#8B5CF6] transition-all flex items-center gap-3"
          >
            <i className="fas fa-plus"></i> {t.userManagement.addBtn}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
           {t.userManagement.stats.map((label: string, i: number) => (
             <div key={i} className="bg-white p-8 rounded-[48px] shadow-sm border border-violet-100">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{label}</p>
                <h4 className={`text-4xl font-black ${i === 1 ? 'text-green-500' : i === 2 ? 'text-[#7B2CF6]' : 'text-slate-900'}`}>{i === 0 ? users.length : i === 1 ? users.length : i === 2 ? '2' : '12'}</h4>
             </div>
           ))}
        </div>

        <div className="bg-white rounded-[56px] shadow-sm border border-violet-100 overflow-hidden">
          <table className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} border-collapse`}>
            <thead>
              <tr className="bg-violet-50 text-[#7B2CF6] text-[11px] font-black uppercase tracking-widest">
                {t.userManagement.table.map((col: string, i: number) => (
                  <th key={i} className="p-8 border-b border-violet-100">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-violet-50/30 transition-all group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-violet-100 text-[#7B2CF6] rounded-2xl flex items-center justify-center font-black">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border ${
                       user.role === UserRole.OWNER ? 'bg-violet-600 text-white border-violet-600' :
                       user.role === UserRole.MANAGER ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                       'bg-slate-50 text-slate-600 border-slate-100'
                     }`}>
                       {t.userManagement.modal.roles[user.role as keyof typeof t.userManagement.modal.roles]}
                     </span>
                  </td>
                  <td className="p-8 font-black text-slate-700 text-sm">{user.location}</td>
                  <td className="p-8 font-black text-slate-400 text-xs">{user.lastActive}</td>
                  <td className="p-8">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                        <span className="text-[11px] font-black text-slate-700">{user.status}</span>
                     </div>
                  </td>
                  <td className="p-8">
                    <div className="flex gap-2">
                      <button className="w-10 h-10 bg-white border border-violet-100 text-[#7B2CF6] rounded-xl flex items-center justify-center hover:bg-[#7B2CF6] hover:text-white transition-all shadow-sm">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => deleteUser(user.id)} className="w-10 h-10 bg-white border border-red-100 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 bg-[#100821] p-10 rounded-[48px] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#7B2CF6]/10 blur-3xl rounded-full"></div>
           <div className="w-20 h-20 bg-[#7B2CF6] rounded-3xl flex items-center justify-center text-3xl shrink-0">
             <i className="fas fa-user-shield"></i>
           </div>
           <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
              <h3 className="text-xl font-black mb-2">{t.userManagement.warningTitle}</h3>
              <p className="text-violet-200/50 font-bold leading-relaxed max-w-3xl">
                {t.userManagement.warningDesc}
              </p>
           </div>
           <Link to="/demo" className={`${lang === 'ar' ? 'mr-auto' : 'ml-auto'} px-8 py-4 bg-white text-[#100821] rounded-2xl font-black text-sm whitespace-nowrap hover:bg-violet-50 transition-all`}>{t.userManagement.backBtn}</Link>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

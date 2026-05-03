import type {FormEvent} from 'react';
import {useEffect, useState} from 'react';
import accountPasswordService from '../services/AccountPasswordService';
import type {AccountPassword} from '../types';
import '../styles/account-password.css';

type AccountPasswordForm = {
  account: string;
  password: string;
  description: string;
};

const emptyForm: AccountPasswordForm = {account: '', password: '', description: ''};

function AccountPasswordPage() {
  const [records, setRecords] = useState<AccountPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  const [createForm, setCreateForm] = useState<AccountPasswordForm>(emptyForm);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState<AccountPasswordForm>(emptyForm);
  const [savingId, setSavingId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const loadRecords = async () => {
    setLoading(true);
    setErrorText('');
    try {
      const data = await accountPasswordService.listAccountPasswords();
      setRecords(data);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '加载账号密码失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      account: createForm.account.trim(),
      password: createForm.password.trim(),
      description: createForm.description.trim(),
    };

    if (!payload.account || !payload.password || !payload.description) {
      setErrorText('账号、密码和描述不能为空');
      return;
    }

    setCreating(true);
    setErrorText('');
    try {
      const created = await accountPasswordService.createAccountPassword(payload);
      setRecords((current) => [created, ...current]);
      setCreateForm(emptyForm);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '创建账号密码失败');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (record: AccountPassword) => {
    setEditingId(record.id);
    setEditForm({
      account: record.account,
      password: record.password,
      description: record.description,
    });
    setErrorText('');
  };

  const saveEdit = async (id: string) => {
    const payload = {
      account: editForm.account.trim(),
      password: editForm.password.trim(),
      description: editForm.description.trim(),
    };

    if (!payload.account || !payload.password || !payload.description) {
      setErrorText('账号、密码和描述不能为空');
      return;
    }

    setSavingId(id);
    setErrorText('');
    try {
      const updated = await accountPasswordService.updateAccountPassword(id, payload);
      setRecords((current) => current.map((item) => (item.id === id ? updated : item)));
      setEditingId('');
      setEditForm(emptyForm);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '更新账号密码失败');
    } finally {
      setSavingId('');
    }
  };

  const remove = async (record: AccountPassword) => {
    if (!window.confirm(`确认删除账号「${record.account}」吗？`)) return;
    setDeletingId(record.id);
    setErrorText('');
    try {
      await accountPasswordService.deleteAccountPassword(record.id);
      setRecords((current) => current.filter((item) => item.id !== record.id));
      if (editingId === record.id) {
        setEditingId('');
        setEditForm(emptyForm);
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '删除账号密码失败');
    } finally {
      setDeletingId('');
    }
  };

  if (loading) return <section className="account-password-page"><p>正在加载账号密码...</p></section>;

  return (
    <section className="account-password-page">
      <header className="account-password-header">
        <h2>账号密码管理</h2>
        <p>用于维护工作台常用账号、密码和说明信息。</p>
      </header>

      <form className="account-password-form" onSubmit={handleCreate}>
        <input placeholder="账号" value={createForm.account} onChange={(e) => setCreateForm((c) => ({...c, account: e.target.value}))} />
        <input placeholder="密码" value={createForm.password} onChange={(e) => setCreateForm((c) => ({...c, password: e.target.value}))} />
        <input placeholder="描述" value={createForm.description} onChange={(e) => setCreateForm((c) => ({...c, description: e.target.value}))} />
        <button type="submit" disabled={creating}>{creating ? '创建中...' : '新增'}</button>
      </form>

      {errorText ? <p className="account-password-error">{errorText}</p> : null}

      <div className="account-password-list">
        {records.map((record) => {
          const isEditing = editingId === record.id;
          return (
            <article key={record.id} className="account-password-item">
              {isEditing ? (
                <>
                  <input value={editForm.account} onChange={(e) => setEditForm((c) => ({...c, account: e.target.value}))} />
                  <input value={editForm.password} onChange={(e) => setEditForm((c) => ({...c, password: e.target.value}))} />
                  <input value={editForm.description} onChange={(e) => setEditForm((c) => ({...c, description: e.target.value}))} />
                  <div className="account-password-actions">
                    <button type="button" onClick={() => saveEdit(record.id)} disabled={savingId === record.id}>{savingId === record.id ? '保存中...' : '保存'}</button>
                    <button type="button" onClick={() => setEditingId('')}>取消</button>
                  </div>
                </>
              ) : (
                <>
                  <p><strong>账号：</strong>{record.account}</p>
                  <p><strong>密码：</strong>{record.password}</p>
                  <p><strong>描述：</strong>{record.description}</p>
                  <div className="account-password-actions">
                    <button type="button" onClick={() => startEdit(record)}>编辑</button>
                    <button type="button" onClick={() => remove(record)} disabled={deletingId === record.id}>{deletingId === record.id ? '删除中...' : '删除'}</button>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AccountPasswordPage;

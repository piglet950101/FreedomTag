import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, UserPlus, Trash2, Mail, User as UserIcon, Building2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { toast } = useToast();
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState("BENEFICIARY");
  const [selectedRoleTab, setSelectedRoleTab] = useState("all");
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; email: string } | null>(null);
  const [deleteOrgDialogOpen, setDeleteOrgDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<{ id: string; name: string } | null>(null);

  // Fetch organizations (charities)
  const { data: organizationsData, isLoading: organizationsLoading, error: organizationsError, refetch: refetchOrganizations } = useQuery<any>({
    queryKey: ['/api/organizations/list'],
    queryFn: async () => {
      const res = await fetch('/api/organizations/list', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch organizations');
      }
      return res.json();
    },
    retry: false,
  });

  const getAuthToken = () => localStorage.getItem('authToken');

  const { data: usersData, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery<any>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        console.error('[Admin] No auth token found');
        throw new Error('No authentication token found. Please log in.');
      }
      console.log('[Admin] Fetching users with token:', token.substring(0, 20) + '...');
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      console.log('[Admin] Users API response status:', res.status);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch users' }));
        console.error('[Admin] Users API error:', errorData);
        throw new Error(errorData.error || `Failed to fetch users: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('[Admin] Users fetched successfully:', data.users?.length || 0, 'users');
      return data;
    },
    retry: false,
    enabled: !!getAuthToken(),
  });

  // Filter users by role category
  const usersByRole = useMemo(() => {
    if (!usersData?.users) return { all: [], ADMIN: [], BENEFICIARY: [], PHILANTHROPIST: [], ORGANIZATION: [] };
    
    const all = usersData.users;
    const admin = all.filter((u: any) => u.roles?.includes('ADMIN'));
    const beneficiary = all.filter((u: any) => u.roles?.includes('BENEFICIARY'));
    const philanthropist = all.filter((u: any) => u.roles?.includes('PHILANTHROPIST'));
    const organization = all.filter((u: any) => u.roles?.includes('ORGANIZATION'));
    
    return { all, ADMIN: admin, BENEFICIARY: beneficiary, PHILANTHROPIST: philanthropist, ORGANIZATION: organization };
  }, [usersData]);

  const createUserMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; fullName: string; role: string }) => {
      const token = getAuthToken();
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create user');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User created successfully" });
      setCreateUserDialogOpen(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFullName("");
      setNewUserRole("BENEFICIARY");
      refetchUsers();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create user", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete user');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User deleted successfully" });
      refetchUsers();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete user", variant: "destructive" });
    },
  });

  const deleteOrganizationMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      const token = getAuthToken();
      const res = await fetch(`/api/organizations/${organizationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete organization');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Organization deleted successfully" });
      refetchOrganizations();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete organization", variant: "destructive" });
    },
  });

  const renderUserCard = (user: any) => (
    <Card key={user.id} data-testid={`card-user-${user.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{user.fullName || user.email}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-3 h-3" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {(user.roles || []).map((role: string) => (
                  <span
                    key={role}
                    className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setUserToDelete({ id: user.id, email: user.email });
              setDeleteUserDialogOpen(true);
            }}
            disabled={deleteUserMutation.isPending}
            data-testid={`button-delete-user-${user.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/admin">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage users and their roles</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div></div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchUsers()}
              disabled={usersLoading}
              data-testid="button-refresh-users"
            >
              {usersLoading ? "Refreshing..." : "Refresh"}
            </Button>
            <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-user">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Create a new user account with a specific role</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-user-email">Email</Label>
                    <Input
                      id="new-user-email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@example.com"
                      data-testid="input-new-user-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-password">Password</Label>
                    <Input
                      id="new-user-password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Enter password"
                      data-testid="input-new-user-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-fullname">Full Name</Label>
                    <Input
                      id="new-user-fullname"
                      value={newUserFullName}
                      onChange={(e) => setNewUserFullName(e.target.value)}
                      placeholder="John Doe"
                      data-testid="input-new-user-fullname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-user-role">Role</Label>
                    <Select value={newUserRole} onValueChange={setNewUserRole}>
                      <SelectTrigger id="new-user-role" data-testid="select-new-user-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BENEFICIARY">Beneficiary</SelectItem>
                        <SelectItem value="PHILANTHROPIST">Philanthropist</SelectItem>
                        <SelectItem value="ORGANIZATION">Organization</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => {
                      if (!newUserEmail || !newUserPassword || !newUserFullName) {
                        toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
                        return;
                      }
                      createUserMutation.mutate({
                        email: newUserEmail,
                        password: newUserPassword,
                        fullName: newUserFullName,
                        role: newUserRole,
                      });
                    }}
                    disabled={createUserMutation.isPending}
                    className="w-full"
                    data-testid="button-submit-create-user"
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {usersLoading ? (
          <div className="text-sm text-muted-foreground">Loading users...</div>
        ) : usersError ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive">Error loading users</p>
            <p className="text-xs text-muted-foreground mt-1">
              {usersError instanceof Error ? usersError.message : 'Unknown error occurred'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => refetchUsers()}
              data-testid="button-retry-users"
            >
              Retry
            </Button>
          </div>
        ) : (
          <Tabs value={selectedRoleTab} onValueChange={setSelectedRoleTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" data-testid="tab-all-users">
                All ({usersByRole.all.length})
              </TabsTrigger>
              <TabsTrigger value="ADMIN" data-testid="tab-admin-users">
                Admin ({usersByRole.ADMIN.length})
              </TabsTrigger>
              <TabsTrigger value="BENEFICIARY" data-testid="tab-beneficiary-users">
                Beneficiary ({usersByRole.BENEFICIARY.length})
              </TabsTrigger>
              <TabsTrigger value="PHILANTHROPIST" data-testid="tab-philanthropist-users">
                Philanthropist ({usersByRole.PHILANTHROPIST.length})
              </TabsTrigger>
              <TabsTrigger value="ORGANIZATION" data-testid="tab-organization-users">
                Organization ({usersByRole.ORGANIZATION.length + (organizationsData?.organizations?.length || 0)})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="space-y-2">
                {usersByRole.all.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No users found</div>
                ) : (
                  usersByRole.all.map(renderUserCard)
                )}
              </div>
            </TabsContent>

            <TabsContent value="ADMIN" className="mt-4">
              <div className="space-y-2">
                {usersByRole.ADMIN.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No admin users found</div>
                ) : (
                  usersByRole.ADMIN.map(renderUserCard)
                )}
              </div>
            </TabsContent>

            <TabsContent value="BENEFICIARY" className="mt-4">
              <div className="space-y-2">
                {usersByRole.BENEFICIARY.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No beneficiary users found</div>
                ) : (
                  usersByRole.BENEFICIARY.map(renderUserCard)
                )}
              </div>
            </TabsContent>

            <TabsContent value="PHILANTHROPIST" className="mt-4">
              <div className="space-y-2">
                {usersByRole.PHILANTHROPIST.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No philanthropist users found</div>
                ) : (
                  usersByRole.PHILANTHROPIST.map(renderUserCard)
                )}
              </div>
            </TabsContent>

            <TabsContent value="ORGANIZATION" className="mt-4">
              <div className="space-y-2">
                {/* Show users with ORGANIZATION role */}
                {usersByRole.ORGANIZATION.length > 0 && (
                  <>
                    {usersByRole.ORGANIZATION.map(renderUserCard)}
                  </>
                )}
                
                {/* Show organizations/charities */}
                {organizationsLoading ? (
                  <div className="text-sm text-muted-foreground">Loading organizations...</div>
                ) : organizationsError ? (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive">Error loading organizations</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {organizationsError instanceof Error ? organizationsError.message : 'Unknown error occurred'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => refetchOrganizations()}
                      data-testid="button-retry-organizations"
                    >
                      Retry
                    </Button>
                  </div>
                ) : organizationsData?.organizations?.length > 0 ? (
                  organizationsData.organizations.map((org: any) => (
                    <Card key={org.id} data-testid={`card-organization-${org.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{org.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {org.email}
                              </div>
                              {org.tagCode && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Tag: {org.tagCode}
                                </div>
                              )}
                              {org.referralCode && (
                                <div className="text-xs text-muted-foreground">
                                  Referral: {org.referralCode}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setOrgToDelete({ id: org.id, name: org.name });
                              setDeleteOrgDialogOpen(true);
                            }}
                            disabled={deleteOrganizationMutation.isPending}
                            data-testid={`button-delete-organization-${org.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : null}
                
                {/* Show message if no organizations found */}
                {usersByRole.ORGANIZATION.length === 0 && 
                 !organizationsLoading && 
                 !organizationsError && 
                 organizationsData?.organizations?.length === 0 && (
                  <div className="text-sm text-muted-foreground">No organizations found</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete user <strong>{userToDelete?.email}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDelete) {
                  deleteUserMutation.mutate(userToDelete.id);
                  setDeleteUserDialogOpen(false);
                  setUserToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Organization Confirmation Dialog */}
      <AlertDialog open={deleteOrgDialogOpen} onOpenChange={setDeleteOrgDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete organization <strong>{orgToDelete?.name}</strong>? This action cannot be undone and will also delete associated tags.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orgToDelete) {
                  deleteOrganizationMutation.mutate(orgToDelete.id);
                  setDeleteOrgDialogOpen(false);
                  setOrgToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


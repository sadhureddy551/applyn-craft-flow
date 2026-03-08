import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Building2, Palette, Globe, CreditCard, Users, Check, Crown,
  Sparkles, Shield, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useWorkspace } from '@/hooks/useWorkspace';
import { PLANS, TIMEZONES, CURRENCIES, DATE_FORMATS, PlanTier } from '@/lib/workspace-types';
import { useToast } from '@/hooks/use-toast';

const PLAN_ICONS: Record<PlanTier, any> = { free: Sparkles, pro: Crown, enterprise: Shield };
const PLAN_COLORS: Record<PlanTier, string> = {
  free: 'border-border',
  pro: 'border-primary ring-1 ring-primary/20',
  enterprise: 'border-amber-500 ring-1 ring-amber-500/20',
};

export default function SettingsPage() {
  const { settings, subscription, updateSettings, changePlan } = useWorkspace();
  const { toast } = useToast();

  const handleSave = () => toast({ title: 'Settings saved', description: 'Workspace settings updated successfully.' });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your workspace, billing, and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general" className="gap-1.5"><Building2 className="h-3.5 w-3.5" />General</TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5"><Palette className="h-3.5 w-3.5" />Branding</TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" />Billing</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5"><Users className="h-3.5 w-3.5" />Team</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workspace Info</CardTitle>
              <CardDescription>Basic details about your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Workspace Name</Label><Input value={settings.name} onChange={e => updateSettings({ name: e.target.value })} /></div>
                <div><Label>Subdomain</Label><div className="flex"><Input value={settings.subdomain} onChange={e => updateSettings({ subdomain: e.target.value })} className="rounded-r-none" /><span className="inline-flex items-center px-3 bg-muted border border-l-0 border-input rounded-r-lg text-xs text-muted-foreground">.applyn.app</span></div></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regional Settings</CardTitle>
              <CardDescription>Configure timezone, currency, and date format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={v => updateSettings({ timezone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz.replace('_', ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={settings.currency} onValueChange={v => updateSettings({ currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={v => updateSettings({ dateFormat: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DATE_FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end"><Button onClick={handleSave} className="gradient-brand text-primary-foreground">Save Changes</Button></div>
        </TabsContent>

        {/* BRANDING */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logo & Branding</CardTitle>
              <CardDescription>Customize your workspace appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Workspace Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl gradient-brand flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">{settings.name.charAt(0)}</span>
                  </div>
                  <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1.5" />Upload Logo</Button>
                </div>
              </div>
              <Separator />
              <div>
                <Label>Brand Color</Label>
                <div className="flex items-center gap-3 mt-2">
                  <input type="color" value="#7C3AED" className="h-10 w-10 rounded-lg border border-border cursor-pointer" onChange={() => {}} />
                  <Input value={settings.brandColor} onChange={e => updateSettings({ brandColor: e.target.value })} className="max-w-[200px]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end"><Button onClick={handleSave} className="gradient-brand text-primary-foreground">Save Changes</Button></div>
        </TabsContent>

        {/* BILLING */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Plan</CardTitle>
              <CardDescription>
                You're on the <span className="font-semibold text-foreground">{PLANS.find(p => p.id === subscription.planId)?.name}</span> plan
                <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'} className="ml-2 text-[10px]">{subscription.status}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Current period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} – {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const Icon = PLAN_ICONS[plan.id];
              const isCurrent = subscription.planId === plan.id;
              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={`relative overflow-hidden transition-all ${PLAN_COLORS[plan.id]} ${isCurrent ? 'bg-primary/[0.02]' : ''}`}>
                    {plan.id === 'pro' && <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg">Popular</div>}
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${plan.id === 'enterprise' ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                          <Icon className={`h-4.5 w-4.5 ${plan.id === 'enterprise' ? 'text-amber-600' : 'text-primary'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          <p className="text-lg font-bold text-foreground">${plan.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul className="space-y-2">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="h-3.5 w-3.5 text-accent shrink-0" />{f}</li>
                        ))}
                      </ul>
                      <Button
                        variant={isCurrent ? 'outline' : plan.id === 'pro' ? 'default' : 'outline'}
                        className={`w-full ${!isCurrent && plan.id === 'pro' ? 'gradient-brand text-primary-foreground' : ''}`}
                        disabled={isCurrent}
                        onClick={() => { changePlan(plan.id); toast({ title: `Switched to ${plan.name}`, description: 'Your plan has been updated.' }); }}
                      >
                        {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* TEAM */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Members</CardTitle>
              <CardDescription>Manage who has access to your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'John Doe', email: 'john@company.com', role: 'Owner' },
                { name: 'Jane Smith', email: 'jane@company.com', role: 'Admin' },
                { name: 'Alex Turner', email: 'alex@company.com', role: 'Editor' },
              ].map(member => (
                <div key={member.email} className="flex items-center gap-3 py-2">
                  <div className="h-9 w-9 rounded-full gradient-brand flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-primary-foreground">{member.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{member.role}</Badge>
                </div>
              ))}
              <Separator />
              <div className="flex gap-2">
                <Input placeholder="Email address" className="flex-1" />
                <Button variant="outline">Invite</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

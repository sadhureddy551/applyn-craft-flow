import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { module_id, trigger_event, record } = await req.json();

    if (!module_id || !trigger_event || !record) {
      return new Response(JSON.stringify({ error: 'Missing module_id, trigger_event, or record' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Fetch active automations for module + trigger
    const { data: automations, error: autoErr } = await supabase
      .from('automations')
      .select('id')
      .eq('module_id', module_id)
      .eq('trigger_event', trigger_event)
      .eq('is_active', true);

    if (autoErr || !automations || automations.length === 0) {
      return new Response(JSON.stringify({ matched: 0, executed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const autoIds = automations.map((a: any) => a.id);

    // Step 2: Fetch conditions and actions
    const [{ data: conditions }, { data: actions }] = await Promise.all([
      supabase.from('automation_conditions').select('*').in('automation_id', autoIds).order('sort_order'),
      supabase.from('automation_actions').select('*').in('automation_id', autoIds).order('sort_order'),
    ]);

    const results: { automation_id: string; matched: boolean; actions_run: number }[] = [];

    for (const auto of automations) {
      const autoConds = (conditions || []).filter((c: any) => c.automation_id === auto.id);
      const autoActions = (actions || []).filter((a: any) => a.automation_id === auto.id);

      // Step 3: Evaluate conditions (all must pass — AND logic)
      const allPass = autoConds.every((cond: any) => {
        const fieldVal = String(record[cond.field_name] ?? '');
        const condVal = cond.value;
        switch (cond.operator) {
          case 'equals': return fieldVal === condVal;
          case 'not_equals': return fieldVal !== condVal;
          case 'contains': return fieldVal.toLowerCase().includes(condVal.toLowerCase());
          case 'greater_than': return parseFloat(fieldVal) > parseFloat(condVal);
          case 'less_than': return parseFloat(fieldVal) < parseFloat(condVal);
          default: return false;
        }
      });

      if (!allPass) {
        results.push({ automation_id: auto.id, matched: false, actions_run: 0 });
        continue;
      }

      // Step 4: Execute actions
      let actionsRun = 0;
      for (const action of autoActions) {
        const config = action.action_config as Record<string, string>;
        try {
          switch (action.action_type) {
            case 'update_field': {
              if (config.field_key && record.id) {
                const currentValues = record.values || {};
                const newValues = { ...currentValues, [config.field_key]: config.new_value };
                await supabase.from('crm_records').update({ values: newValues }).eq('id', record.id);
              }
              break;
            }
            case 'assign_owner': {
              if (record.id) {
                const currentValues = record.values || {};
                const newValues = { ...currentValues, owner: config.owner };
                await supabase.from('crm_records').update({ values: newValues }).eq('id', record.id);
              }
              break;
            }
            case 'send_email': {
              // Log the intent — actual sending would use the send-email edge function
              console.log(`[Automation] Send email to ${config.to}, subject: ${config.subject}`);
              break;
            }
            case 'send_whatsapp': {
              console.log(`[Automation] Send WhatsApp to ${config.to}, message: ${config.message}`);
              break;
            }
            case 'create_task': {
              console.log(`[Automation] Create task: ${config.title}, assignee: ${config.assignee}`);
              break;
            }
          }
          actionsRun++;
        } catch (e) {
          console.error(`Action ${action.action_type} failed:`, e);
        }
      }

      results.push({ automation_id: auto.id, matched: true, actions_run: actionsRun });
    }

    return new Response(JSON.stringify({
      matched: results.filter((r) => r.matched).length,
      executed: results.reduce((sum, r) => sum + r.actions_run, 0),
      details: results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// deno-lint-ignore-file
// @ts-nocheck: Supabase Edge Function — runs in Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// 🛠️ Helper to get YouTube thumbnails
function getYTThumb(url: string) {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url?.match(regExp);
  return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : null;
}

serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record || payload.new //
    if (!record) return new Response("No record", { status: 400 })

    // 1. Fetch User Profile
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', record.user_id)
      .single()

    const clientName = profile?.full_name || "Unknown Client"
    const genreIcon = record.genre === 'rnr' ? '🎸' : '💃'
    const price = new Intl.NumberFormat('hu-HU').format(record.total_price || 0)
    
    // 🖼️ 2. Build the "Track Carousel" (Clickable List)
    const trackDetails = record.tracks?.map((t: any, i: number) => {
      return `**${i + 1}. [${t.title}](${t.url})**\n*${t.base_bpm || '?' } → ${t.target_bpm || record.target_bpm || '?'} BPM*`
    }).join('\n\n') || "No tracks provided"

    // Use the first track's thumbnail as the main embed image
    const mainThumb = record.tracks?.[0]?.url ? getYTThumb(record.tracks[0].url) : null;

    const discordMessage = {
      embeds: [{
        title: `🆕 NEW REQUEST: ${record.title}`,
        description: `👤 **Client:** ${clientName}\n🛠️ **Service:** ${record.service_name}\n\n**🎹 TRACK LISTING (SNEAK PEAK):**\n${trackDetails}`,
        color: record.genre === 'rnr' ? 15548997 : 10181046, // Orange vs Purple
        thumbnail: { url: mainThumb },
        fields: [
          { name: "💰 Budget", value: `**${price} FT**`, inline: true },
          { name: "🏷️ Genre", value: `${genreIcon} ${record.genre === 'rnr' ? 'R&R' : 'Fashion'}`, inline: true },
          { name: "⏱️ Global BPM", value: `**${record.target_bpm || 'Varies'}**`, inline: true },
          { name: "📝 Instructions", value: record.description || "*None*", inline: false }
        ],
        footer: { text: `Hard Deadline: ${record.deadline || "ASAP"}` },
        timestamp: new Date().toISOString()
      }],
      components: [
        {
          type: 1, // Action Row
          components: [
            {
              type: 2,
              style: 5,
              label: "📂 Open Admin Board",
              url: "https://songtailor.vercel.app/admin" // Update with your actual domain
            },
            {
              type: 2,
              style: 5,
              label: "➕ New Request",
              url: "https://songtailor.vercel.app/request" // Update with your actual domain
            }
          ]
        }
      ]
    }

    await fetch(DISCORD_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage),
    })

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error("Discord Error:", message)
    return new Response(message, { status: 500 })
  }
})
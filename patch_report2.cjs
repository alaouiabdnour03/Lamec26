const fs = require('fs');
let code = fs.readFileSync('src/ReportGenerator.tsx', 'utf-8');

const oldUpload = `        if (!uploadError) {
          const { data: publicData } = supabase.storage.from('reports').getPublicUrl(filePath);
          publicUrl = publicData.publicUrl;
          
          await supabase
            .from('diagnostics')
            .update({
              status: 'report_generated',
              report_url: publicUrl,
              report_filename: dlName,
              report_size_kb: sizeKb
            })
            .eq('id', diagnosticId);
        } else {
          console.error("Failed to upload report to Supabase:", uploadError);
        }`;

const newUpload = `        if (!uploadError) {
          const { data: publicData } = supabase.storage.from('reports').getPublicUrl(filePath);
          publicUrl = publicData.publicUrl;
          
          await supabase
            .from('diagnostics')
            .update({
              status: 'report_generated',
              report_url: publicUrl,
              report_filename: dlName,
              report_size_kb: sizeKb
            })
            .eq('id', diagnosticId);
        } else {
          console.error("Failed to upload report to Supabase:", uploadError);
          // If upload fails, just keep the local object URL so they can still download it,
          // but we also update the DB to say it's completed (but we don't have the cloud URL)
          await supabase
            .from('diagnostics')
            .update({
              status: 'report_generated',
              report_url: publicUrl, // this is the local blob URL
              report_filename: dlName,
              report_size_kb: sizeKb
            })
            .eq('id', diagnosticId);
        }`;

code = code.replace(oldUpload, newUpload);
fs.writeFileSync('src/ReportGenerator.tsx', code);
console.log('patched report2');

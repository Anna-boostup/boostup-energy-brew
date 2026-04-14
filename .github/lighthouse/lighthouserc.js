export default {
  ci: {
    collect: {
      settings: {
        extraHeaders: {
          'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
          'x-vercel-set-bypass-cookie': 'true'
        }
      }
    }
  }
};

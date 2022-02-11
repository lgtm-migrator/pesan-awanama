// pages/api/message.ts

import { withIronSessionApiRoute } from 'iron-session/next';
import type { NextApiRequest, NextApiResponse } from 'next';

import { deleteMessage, getMessages } from '@/lib/fauna';

type ReqBody = {
  refId: string;
};

export default withIronSessionApiRoute(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const user = req.session.user;

    if (!user || user?.admin !== true) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    switch (req.method) {
      case 'GET': {
        const messages = await getMessages();

        res.status(200).json({ messages });
        break;
      }
      case 'DELETE': {
        const { refId }: ReqBody = req.body;
        await deleteMessage(refId);

        res.status(204).end();
        break;
      }
      default:
        res.status(405).json({ message: 'Method Not Allowed' });
    }
  },
  {
    cookieName: 'anjay_kue',
    password: process.env.COOKIE_PASS as string,
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  }
);

'use server';

import { db } from '@/firebase/admin';

export async function createResume(params: CreateResumeParams) {
  const { userId, title, templateId, data } = params;

  try {
    const resumeData = {
      userId,
      title,
      templateId,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('resumes').add(resumeData);

    return {
      success: true,
      resumeId: docRef.id,
    };
  } catch (error) {
    console.error('Error creating resume:', error);
    return {
      success: false,
      resumeId: '',
      message: 'Failed to create resume',
    };
  }
}

export async function getResume(resumeId: string) {
  try {
    const doc = await db.collection('resumes').doc(resumeId).get();

    if (!doc.exists) {
      return { success: false, message: 'Resume not found' };
    }

    return {
      success: true,
      resume: { id: doc.id, ...doc.data() } as ResumeDocument,
    };
  } catch (error) {
    console.error('Error fetching resume:', error);
    return { success: false, message: 'Failed to fetch resume' };
  }
}

export async function getUserResumes(userId: string) {
  try {
    const snapshot = await db
      .collection('resumes')
      .where('userId', '==', userId)
      .get();

    const resumes = snapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
      })
    ) as ResumeDocument[];

    resumes.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return { success: true, resumes };
  } catch (error) {
    console.error('Error fetching user resumes:', error);
    return { success: false, resumes: [] as ResumeDocument[] };
  }
}

export async function updateResume(params: UpdateResumeParams) {
  const { resumeId, userId, ...fields } = params;

  try {
    const doc = await db.collection('resumes').doc(resumeId).get();

    if (!doc.exists) {
      return { success: false, message: 'Resume not found' };
    }

    if (doc.data()?.userId !== userId) {
      return { success: false, message: 'Unauthorized' };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (fields.title !== undefined) updateData.title = fields.title;
    if (fields.templateId !== undefined) updateData.templateId = fields.templateId;
    if (fields.data !== undefined) updateData.data = fields.data;

    await db.collection('resumes').doc(resumeId).update(updateData);

    return { success: true, message: 'Resume updated successfully' };
  } catch (error) {
    console.error('Error updating resume:', error);
    return { success: false, message: 'Failed to update resume' };
  }
}

export async function deleteResume(params: DeleteResumeParams) {
  const { resumeId, userId } = params;

  try {
    const doc = await db.collection('resumes').doc(resumeId).get();

    if (!doc.exists) {
      return { success: false, message: 'Resume not found' };
    }

    if (doc.data()?.userId !== userId) {
      return { success: false, message: 'Unauthorized' };
    }

    await db.collection('resumes').doc(resumeId).delete();

    return { success: true, message: 'Resume deleted successfully' };
  } catch (error) {
    console.error('Error deleting resume:', error);
    return { success: false, message: 'Failed to delete resume' };
  }
}

export async function duplicateResume(resumeId: string, userId: string) {
  try {
    const doc = await db.collection('resumes').doc(resumeId).get();

    if (!doc.exists) {
      return { success: false, resumeId: '', message: 'Resume not found' };
    }

    const original = doc.data();

    if (original?.userId !== userId) {
      return { success: false, resumeId: '', message: 'Unauthorized' };
    }

    const newResume = {
      userId,
      title: `Copy of ${original.title}`,
      templateId: original.templateId,
      data: original.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newDocRef = await db.collection('resumes').add(newResume);

    return { success: true, resumeId: newDocRef.id };
  } catch (error) {
    console.error('Error duplicating resume:', error);
    return { success: false, resumeId: '', message: 'Failed to duplicate resume' };
  }
}

export async function deleteAllResumes(params: DeleteAllResumesParams) {
  const { userId } = params;

  try {
    const snapshot = await db.collection('resumes').where('userId', '==', userId).get();

    if (snapshot.empty) {
      return { success: true, deletedCount: 0, message: 'No resumes found' };
    }

    const docs = snapshot.docs;
    const chunkSize = 450;
    let deletedCount = 0;

    for (let i = 0; i < docs.length; i += chunkSize) {
      const chunk = docs.slice(i, i + chunkSize);
      const batch = db.batch();

      chunk.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      deletedCount += chunk.length;
    }

    return {
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} resume${deletedCount === 1 ? '' : 's'} successfully`,
    };
  } catch (error) {
    console.error('Error deleting all resumes:', error);
    return { success: false, deletedCount: 0, message: 'Failed to delete all resumes' };
  }
}

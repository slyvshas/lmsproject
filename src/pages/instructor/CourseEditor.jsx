// ============================================================================
// Course Editor — Educative-style Block Content Editor
// ============================================================================
// Full course editor with modules, lessons, and a block-based content system.
// Supports rich text editing, YouTube video embeds, images, code blocks,
// callout boxes, and more — similar to Educative.io / Notion.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { fetchCourseDetails, updateCourse } from '../../services/courseService';
import {
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../../services/contentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// ---- Inline Styles ----
const styles = {
  courseEditor: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  editorError: {
    padding: '2rem',
    textAlign: 'center',
    color: '#ef4444',
    fontSize: '1.2rem',
  },
  editorTopbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    background: 'rgba(20, 20, 45, 0.95)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  btnBackEditor: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  courseInfoBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  courseInfoBarH2: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  pubBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  pubBadgePublished: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
  },
  pubBadgeDraft: {
    background: 'rgba(234, 179, 8, 0.2)',
    color: '#eab308',
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  lessonCount: {
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  saveStatus: {
    fontSize: '0.85rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  saveStatusSuccess: {
    color: '#22c55e',
    background: 'rgba(34, 197, 94, 0.1)',
  },
  saveStatusError: {
    color: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  unsavedDot: {
    color: '#eab308',
    fontSize: '1.2rem',
  },
  btnPublish: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    color: '#fff',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  btnPublishUnpublish: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  editorLayout: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  editorSidebar: {
    width: '320px',
    minWidth: '280px',
    background: 'rgba(20, 20, 45, 0.95)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  sidebarHeaderH3: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
  },
  modulesTree: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.5rem',
  },
  moduleTreeItem: {
    marginBottom: '0.5rem',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'rgba(30, 30, 60, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  moduleTreeHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
    gap: '0.5rem',
  },
  collapseArrow: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    transition: 'transform 0.2s',
  },
  collapseArrowCollapsed: {
    transform: 'rotate(-90deg)',
  },
  moduleTreeNumber: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  moduleRenameInput: {
    flex: 1,
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    borderRadius: '4px',
    padding: '0.25rem 0.5rem',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  moduleTreeTitle: {
    flex: 1,
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  moduleActions: {
    display: 'flex',
    gap: '0.25rem',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  moduleActionsVisible: {
    opacity: 1,
  },
  btnIconSm: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.25rem 0.4rem',
    fontSize: '0.85rem',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  btnIconSmDelete: {
    color: '#ef4444',
  },
  lessonsTree: {
    paddingLeft: '1rem',
    paddingBottom: '0.5rem',
  },
  lessonTreeItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.25rem',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s',
    gap: '0.5rem',
    background: 'rgba(30, 30, 60, 0.3)',
  },
  lessonTreeItemActive: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
  },
  lessonTreeIcon: {
    fontSize: '0.85rem',
  },
  lessonTreeTitle: {
    flex: 1,
    fontSize: '0.85rem',
    color: '#e2e8f0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  lessonTreeDuration: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginRight: '0.25rem',
  },
  addLessonInline: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    marginTop: '0.25rem',
  },
  addLessonInlineInput: {
    flex: 1,
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  btnAddInline: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    color: '#fff',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAddLesson: {
    background: 'transparent',
    border: '1px dashed rgba(99, 102, 241, 0.5)',
    color: '#6366f1',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    width: '100%',
    textAlign: 'center',
    marginTop: '0.25rem',
    transition: 'all 0.2s',
  },
  addModuleSection: {
    padding: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '0.5rem',
  },
  addModuleSectionInput: {
    flex: 1,
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  btnAddModule: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },
  editorMain: {
    flex: 1,
    overflow: 'auto',
    padding: '1.5rem',
  },
  lessonEditor: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  lessonEditorHeader: {
    marginBottom: '1.5rem',
  },
  lessonTitleInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid rgba(99, 102, 241, 0.3)',
    color: '#fff',
    fontSize: '1.75rem',
    fontWeight: 700,
    padding: '0.5rem 0',
    marginBottom: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  lessonMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  durationLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  durationInput: {
    width: '60px',
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.35rem 0.5rem',
    color: '#fff',
    fontSize: '0.9rem',
    textAlign: 'center',
    outline: 'none',
  },
  editorModeToggle: {
    display: 'flex',
    background: 'rgba(30, 30, 60, 0.8)',
    borderRadius: '8px',
    padding: '0.25rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  modeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  modeBtnActive: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
  },
  btnSaveLesson: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    border: 'none',
    color: '#fff',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    marginLeft: 'auto',
  },
  lessonPreview: {
    background: 'rgba(30, 30, 60, 0.8)',
    borderRadius: '12px',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  previewLessonTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid rgba(99, 102, 241, 0.3)',
  },
  blocksEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  blockWrapper: {
    position: 'relative',
  },
  blockInsertZone: {
    position: 'relative',
    padding: '0.5rem 0',
    display: 'flex',
    justifyContent: 'center',
  },
  btnInsertBlock: {
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    opacity: 0.4,
    transition: 'opacity 0.2s',
    padding: '0.25rem 0',
  },
  insertLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(99, 102, 241, 0.3)',
  },
  insertIcon: {
    color: '#6366f1',
    fontSize: '1.25rem',
    padding: '0 0.75rem',
    fontWeight: 700,
  },
  blockMenu: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(20, 20, 45, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '1rem',
    zIndex: 50,
    minWidth: '400px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
  },
  blockMenuHeader: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  blockMenuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
  },
  blockMenuItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(30, 30, 60, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  bmiIcon: {
    fontSize: '1.25rem',
    lineHeight: 1,
  },
  bmiInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  bmiLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#fff',
  },
  bmiDesc: {
    fontSize: '0.7rem',
    color: '#64748b',
  },
  emptyBlocks: {
    textAlign: 'center',
    padding: '3rem 2rem',
    background: 'rgba(30, 30, 60, 0.5)',
    borderRadius: '12px',
    border: '1px dashed rgba(99, 102, 241, 0.3)',
  },
  emptyBlocksP: {
    color: '#94a3b8',
    marginBottom: '1.5rem',
  },
  blockMenuGridInitial: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  editorEmptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1.5rem',
  },
  emptyStateH2: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '0.75rem',
  },
  emptyStateP: {
    fontSize: '1rem',
    color: '#94a3b8',
    marginBottom: '2rem',
    maxWidth: '400px',
  },
  emptyTips: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    maxWidth: '500px',
  },
  tipCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    background: 'rgba(30, 30, 60, 0.8)',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'left',
  },
  tipCardSpan: {
    fontSize: '1.5rem',
  },
  tipCardStrong: {
    color: '#fff',
    fontSize: '0.9rem',
    display: 'block',
    marginBottom: '0.25rem',
  },
  tipCardP: {
    color: '#64748b',
    fontSize: '0.8rem',
    margin: 0,
  },
  blockEditor: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    overflow: 'hidden',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  blockControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    background: 'rgba(15, 15, 35, 0.5)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  blockControlsVisible: {
    opacity: 1,
  },
  blockTypeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: 500,
  },
  blockControlButtons: {
    display: 'flex',
    gap: '0.25rem',
  },
  ctrlBtn: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.2s',
  },
  ctrlBtnDanger: {
    color: '#ef4444',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  blockBody: {
    padding: '0.75rem 1rem',
  },
  textBlockEditor: {
    border: '1px solid transparent',
    borderRadius: '6px',
    transition: 'border-color 0.2s',
  },
  textBlockEditorFocused: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  textFormatBar: {
    display: 'flex',
    gap: '0.25rem',
    marginBottom: '0.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  fmtBtn: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#e2e8f0',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  fmtBtnMono: {
    fontFamily: 'monospace',
  },
  textBlockTextarea: {
    width: '100%',
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.75rem',
    color: '#fff',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
    minHeight: '100px',
  },
  headingBlockEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  headingLevelSelector: {
    display: 'flex',
    gap: '0.25rem',
  },
  levelBtn: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  levelBtnActive: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    borderColor: 'transparent',
  },
  headingInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid rgba(99, 102, 241, 0.3)',
    color: '#fff',
    fontWeight: 700,
    padding: '0.5rem 0',
    outline: 'none',
  },
  headingInputH1: { fontSize: '2rem' },
  headingInputH2: { fontSize: '1.5rem' },
  headingInputH3: { fontSize: '1.25rem' },
  headingInputH4: { fontSize: '1rem' },
  codeBlockEditor: {
    background: 'rgba(15, 15, 35, 0.9)',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    background: 'rgba(30, 30, 60, 0.5)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  langSelect: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: '#fff',
    padding: '0.25rem 0.5rem',
    fontSize: '0.8rem',
    outline: 'none',
    cursor: 'pointer',
  },
  codeLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  codeTextarea: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    padding: '1rem',
    color: '#e2e8f0',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    resize: 'vertical',
    outline: 'none',
    minHeight: '120px',
  },
  imageBlockEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  imageInputs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  imgInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  inputIcon: {
    fontSize: '1rem',
    width: '24px',
    textAlign: 'center',
  },
  imgUrlInput: {
    flex: 1,
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  imagePreviewContainer: {
    background: 'rgba(15, 15, 35, 0.5)',
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
  },
  imagePreviewImg: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '6px',
  },
  imgError: {
    color: '#ef4444',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  imgCaption: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontStyle: 'italic',
    marginTop: '0.5rem',
  },
  videoBlockEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  videoInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  videoUrlInput: {
    flex: 1,
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  videoEmbedContainer: {
    background: 'rgba(15, 15, 35, 0.5)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  videoIframe: {
    width: '100%',
    aspectRatio: '16/9',
    border: 'none',
    borderRadius: '6px',
  },
  videoCaption: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '0.5rem',
    margin: 0,
  },
  videoError: {
    color: '#ef4444',
    padding: '2rem',
    textAlign: 'center',
  },
  videoPlaceholder: {
    padding: '3rem 2rem',
    textAlign: 'center',
    background: 'rgba(15, 15, 35, 0.5)',
    borderRadius: '8px',
    border: '1px dashed rgba(255, 255, 255, 0.2)',
    color: '#64748b',
  },
  videoPlaceholderSpan: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  calloutBlockEditor: {
    borderLeft: '4px solid',
    borderRadius: '6px',
    background: 'rgba(15, 15, 35, 0.5)',
    padding: '0.75rem',
  },
  calloutTypeSelector: {
    display: 'flex',
    gap: '0.25rem',
    marginBottom: '0.75rem',
  },
  calloutTypeBtn: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '0.35rem 0.6rem',
    fontSize: '1rem',
    transition: 'all 0.2s',
  },
  calloutTypeBtnActive: {
    background: 'rgba(99, 102, 241, 0.3)',
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  calloutContentArea: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  calloutIcon: {
    fontSize: '1.25rem',
    lineHeight: 1,
    marginTop: '0.25rem',
  },
  calloutTextarea: {
    flex: 1,
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: '#fff',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    resize: 'vertical',
    outline: 'none',
  },
  listBlockEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  listTypeToggle: {
    display: 'flex',
    gap: '0.25rem',
  },
  listTypeBtn: {
    background: 'rgba(30, 30, 60, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  listTypeBtnActive: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    borderColor: 'transparent',
  },
  listItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  listItemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  listMarker: {
    color: '#6366f1',
    fontWeight: 700,
    width: '20px',
    textAlign: 'center',
  },
  listItemInput: {
    flex: 1,
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  btnRemoveListItem: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.25rem',
  },
  btnAddListItem: {
    background: 'transparent',
    border: '1px dashed rgba(99, 102, 241, 0.5)',
    color: '#6366f1',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  quoteBlockEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    borderLeft: '4px solid #6366f1',
    paddingLeft: '1rem',
  },
  quoteTextarea: {
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.75rem',
    color: '#fff',
    fontSize: '1rem',
    fontStyle: 'italic',
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
  },
  quoteAuthor: {
    background: 'rgba(15, 15, 35, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: '#94a3b8',
    fontSize: '0.9rem',
    outline: 'none',
  },
  dividerBlock: {
    padding: '1rem 0',
  },
  dividerBlockHr: {
    border: 'none',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)',
  },
  // Preview styles
  previewText: {
    fontSize: '1rem',
    lineHeight: 1.7,
    color: '#e2e8f0',
    marginBottom: '1rem',
  },
  previewHeading: {
    color: '#fff',
    fontWeight: 700,
    marginTop: '1.5rem',
    marginBottom: '1rem',
  },
  previewCode: {
    background: 'rgba(15, 15, 35, 0.9)',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  codeLangBadge: {
    display: 'inline-block',
    background: 'rgba(99, 102, 241, 0.3)',
    color: '#a5b4fc',
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: '0 0 6px 0',
  },
  previewCodePre: {
    padding: '1rem',
    margin: 0,
    overflow: 'auto',
  },
  previewCodeCode: {
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    fontSize: '0.9rem',
    color: '#e2e8f0',
  },
  previewImage: {
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  previewImageImg: {
    maxWidth: '100%',
    borderRadius: '8px',
  },
  previewImageCaption: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontStyle: 'italic',
    marginTop: '0.5rem',
  },
  previewVideo: {
    marginBottom: '1.5rem',
  },
  previewCallout: {
    borderLeft: '4px solid',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  calloutPreviewIcon: {
    fontSize: '1.25rem',
    lineHeight: 1,
  },
  previewCalloutP: {
    margin: 0,
    color: '#e2e8f0',
    lineHeight: 1.6,
  },
  previewDivider: {
    border: 'none',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)',
    margin: '1.5rem 0',
  },
  previewList: {
    marginBottom: '1rem',
    paddingLeft: '1.5rem',
    color: '#e2e8f0',
    lineHeight: 1.8,
  },
  previewQuote: {
    borderLeft: '4px solid #6366f1',
    paddingLeft: '1.5rem',
    margin: '1.5rem 0',
    fontStyle: 'italic',
    color: '#e2e8f0',
  },
  previewQuoteP: {
    margin: 0,
    fontSize: '1.1rem',
    lineHeight: 1.6,
  },
  previewQuoteCite: {
    display: 'block',
    marginTop: '0.75rem',
    color: '#94a3b8',
    fontStyle: 'normal',
    fontSize: '0.9rem',
  },
  mdInlineCode: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    fontSize: '0.85em',
  },
};

// ---- Block types ----
const BLOCK_TYPES = [
  { type: 'text', icon: '📝', label: 'Text', desc: 'Rich text paragraph' },
  { type: 'heading', icon: '🔤', label: 'Heading', desc: 'Section heading' },
  { type: 'code', icon: '💻', label: 'Code', desc: 'Code block with syntax' },
  { type: 'image', icon: '🖼️', label: 'Image', desc: 'Image from URL' },
  { type: 'video', icon: '▶️', label: 'Video', desc: 'YouTube / video embed' },
  { type: 'callout', icon: '💡', label: 'Callout', desc: 'Info / tip / warning box' },
  { type: 'divider', icon: '➖', label: 'Divider', desc: 'Horizontal separator' },
  { type: 'list', icon: '📋', label: 'List', desc: 'Bullet or numbered list' },
  { type: 'quote', icon: '❝', label: 'Quote', desc: 'Blockquote' },
];

const CALLOUT_STYLES = [
  { type: 'info', icon: '💡', label: 'Info', color: '#3b82f6' },
  { type: 'tip', icon: '✅', label: 'Tip', color: '#10b981' },
  { type: 'warning', icon: '⚠️', label: 'Warning', color: '#f59e0b' },
  { type: 'danger', icon: '❌', label: 'Danger', color: '#ef4444' },
  { type: 'note', icon: '📌', label: 'Note', color: '#8b5cf6' },
];

const CODE_LANGUAGES = [
  'javascript', 'python', 'java', 'cpp', 'csharp', 'typescript',
  'html', 'css', 'sql', 'bash', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
];

// ---- Helpers ----
const createBlock = (type, extra = {}) => ({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  type,
  ...getDefaultBlockData(type),
  ...extra,
});

const getDefaultBlockData = (type) => {
  switch (type) {
    case 'text': return { content: '' };
    case 'heading': return { content: '', level: 2 };
    case 'code': return { content: '', language: 'javascript' };
    case 'image': return { url: '', alt: '', caption: '' };
    case 'video': return { url: '', caption: '' };
    case 'callout': return { content: '', calloutType: 'info' };
    case 'divider': return {};
    case 'list': return { items: [''], ordered: false };
    case 'quote': return { content: '', author: '' };
    default: return { content: '' };
  }
};

// Extract YouTube embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  // Already an embed URL
  if (url.includes('youtube.com/embed/')) return url;
  return null;
};

// Serialize blocks to JSON string for storage
const serializeBlocks = (blocks) => JSON.stringify(blocks);

// Deserialize content — handle both legacy markdown and new block format
const deserializeContent = (content) => {
  if (!content) return [createBlock('text')];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    // Legacy markdown content — wrap in a single text block
    return [createBlock('text', { content })];
  }
  return [createBlock('text')];
};

// ============================================================================
// Main CourseEditor component
// ============================================================================
const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lesson editing
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState(10);
  const [blocks, setBlocks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Module creation
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');

  // Lesson creation
  const [addingLessonToModule, setAddingLessonToModule] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  // Publish & UI
  const [isPublishing, setIsPublishing] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(null); // index to insert after
  const [collapsedModules, setCollapsedModules] = useState({});
  const [previewMode, setPreviewMode] = useState(false);

  // ---- Load course ----
  const loadCourse = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchCourseDetails(courseId);
      if (result.error) { setError(result.error); return; }
      const courseData = result.data;
      if (courseData?.modules) {
        courseData.modules.sort((a, b) => a.order_index - b.order_index);
        courseData.modules.forEach((m) => {
          if (m.lessons) m.lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        });
      }
      setCourse(courseData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  // ---- Module CRUD ----
  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    setIsAddingModule(true);
    try {
      const orderIndex = (course.modules?.length || 0) + 1;
      const result = await createModule({
        course_id: courseId,
        title: newModuleTitle.trim(),
        order_index: orderIndex,
      });
      if (result.error) alert('Failed: ' + result.error);
      else { setNewModuleTitle(''); await loadCourse(); }
    } catch (err) { alert(err.message); }
    finally { setIsAddingModule(false); }
  };

  const handleRenameModule = async (moduleId) => {
    if (!editModuleTitle.trim()) return;
    await updateModule(moduleId, { title: editModuleTitle.trim() });
    setEditingModuleId(null);
    await loadCourse();
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    const result = await deleteModule(moduleId);
    if (result.error) alert('Failed: ' + result.error);
    else {
      if (activeLesson?.module_id === moduleId) setActiveLesson(null);
      await loadCourse();
    }
  };

  const toggleModuleCollapse = (moduleId) => {
    setCollapsedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // ---- Lesson CRUD ----
  const handleAddLesson = async (moduleId) => {
    if (!newLessonTitle.trim()) return;
    try {
      const mod = course.modules.find((m) => m.id === moduleId);
      const orderIndex = (mod?.lessons?.length || 0) + 1;
      const initialContent = serializeBlocks([createBlock('text')]);
      const result = await createLesson({
        module_id: moduleId,
        title: newLessonTitle.trim(),
        content: initialContent,
        order_index: orderIndex,
        duration_minutes: 5,
      });
      if (result.error) alert('Failed: ' + result.error);
      else {
        setNewLessonTitle('');
        setAddingLessonToModule(null);
        await loadCourse();
        openLesson({ ...result.data, module_id: moduleId });
      }
    } catch (err) { alert(err.message); }
  };

  const openLesson = (lesson) => {
    // Warn about unsaved changes
    if (hasChanges && activeLesson) {
      if (!window.confirm('You have unsaved changes. Discard and switch?')) return;
    }
    setActiveLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDuration(lesson.duration_minutes || 10);
    setBlocks(deserializeContent(lesson.content));
    setHasChanges(false);
    setSaveStatus('');
    setPreviewMode(false);
    setShowBlockMenu(null);
  };

  const handleSaveLesson = async () => {
    if (!activeLesson) return;
    setIsSaving(true);
    setSaveStatus('');
    try {
      const result = await updateLesson(activeLesson.id, {
        title: lessonTitle,
        content: serializeBlocks(blocks),
        duration_minutes: parseInt(lessonDuration) || 5,
      });
      if (result.error) {
        setSaveStatus('Error saving');
        alert('Failed: ' + result.error);
      } else {
        setSaveStatus('Saved ✓');
        setHasChanges(false);
        await loadCourse();
        setActiveLesson((prev) => ({ ...prev, ...result.data }));
      }
    } catch (err) { setSaveStatus('Error'); }
    finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    const result = await deleteLesson(lessonId);
    if (result.error) alert('Failed: ' + result.error);
    else {
      if (activeLesson?.id === lessonId) {
        setActiveLesson(null);
        setBlocks([]);
      }
      await loadCourse();
    }
  };

  // ---- Publish ----
  const handleTogglePublish = async () => {
    setIsPublishing(true);
    try {
      const result = await updateCourse(courseId, { is_published: !course.is_published });
      if (result.error) alert('Failed: ' + result.error);
      else await loadCourse();
    } catch (err) { alert(err.message); }
    finally { setIsPublishing(false); }
  };

  // ---- Block operations ----
  const updateBlock = (blockId, updates) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b)));
    setHasChanges(true);
  };

  const addBlockAfter = (index, type) => {
    const newBlock = createBlock(type);
    setBlocks((prev) => {
      const updated = [...prev];
      updated.splice(index + 1, 0, newBlock);
      return updated;
    });
    setShowBlockMenu(null);
    setHasChanges(true);
  };

  const removeBlock = (blockId) => {
    setBlocks((prev) => {
      const filtered = prev.filter((b) => b.id !== blockId);
      return filtered.length === 0 ? [createBlock('text')] : filtered;
    });
    setHasChanges(true);
  };

  const moveBlock = (blockId, direction) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const updated = [...prev];
      [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
      return updated;
    });
    setHasChanges(true);
  };

  const duplicateBlock = (blockId) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx < 0) return prev;
      const clone = { ...prev[idx], id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
      const updated = [...prev];
      updated.splice(idx + 1, 0, clone);
      return updated;
    });
    setHasChanges(true);
  };

  // ---- Keyboard shortcut ----
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeLesson) handleSaveLesson();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeLesson, blocks, lessonTitle, lessonDuration]);

  // ---- Render ----
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div style={styles.editorError}>Error: {error}</div>;
  if (!course) return <div style={styles.editorError}>Course not found</div>;

  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;

  return (
    <div style={styles.courseEditor}>
      {/* Top Bar */}
      <div style={styles.editorTopbar}>
        <div style={styles.topbarLeft}>
          <button onClick={() => navigate('/instructor/dashboard')} style={styles.btnBackEditor}>
            ← Back
          </button>
          <div style={styles.courseInfoBar}>
            <h2 style={styles.courseInfoBarH2}>{course.title}</h2>
            <span style={{...styles.pubBadge, ...(course.is_published ? styles.pubBadgePublished : styles.pubBadgeDraft)}}>
              {course.is_published ? '● Live' : '○ Draft'}
            </span>
          </div>
        </div>
        <div style={styles.topbarRight}>
          <span style={styles.lessonCount}>{totalLessons} lesson{totalLessons !== 1 ? 's' : ''}</span>
          {saveStatus && <span style={{...styles.saveStatus, ...(saveStatus.includes('Error') ? styles.saveStatusError : styles.saveStatusSuccess)}}>{saveStatus}</span>}
          {hasChanges && <span style={styles.unsavedDot} title="Unsaved changes">●</span>}
          <button
            onClick={handleTogglePublish}
            disabled={isPublishing}
            style={{...styles.btnPublish, ...(course.is_published ? styles.btnPublishUnpublish : {})}}
          >
            {isPublishing ? '...' : course.is_published ? 'Unpublish' : '🚀 Publish'}
          </button>
        </div>
      </div>

      <div style={styles.editorLayout}>
        {/* ---- Sidebar ---- */}
        <aside style={styles.editorSidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarHeaderH3}>📚 Course Content</h3>
          </div>

          <div style={styles.modulesTree}>
            {course.modules?.map((mod, mIdx) => (
              <div key={mod.id} style={styles.moduleTreeItem}>
                <div style={styles.moduleTreeHeader} onClick={() => toggleModuleCollapse(mod.id)}>
                  <span style={{...styles.collapseArrow, ...(collapsedModules[mod.id] ? styles.collapseArrowCollapsed : {})}}>▾</span>
                  <span style={styles.moduleTreeNumber}>M{mIdx + 1}</span>
                  {editingModuleId === mod.id ? (
                    <input
                      style={styles.moduleRenameInput}
                      value={editModuleTitle}
                      onChange={(e) => setEditModuleTitle(e.target.value)}
                      onBlur={() => handleRenameModule(mod.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameModule(mod.id);
                        if (e.key === 'Escape') setEditingModuleId(null);
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span style={styles.moduleTreeTitle}>{mod.title}</span>
                  )}
                  <div style={styles.moduleActions} onClick={(e) => e.stopPropagation()}>
                    <button
                      style={styles.btnIconSm}
                      onClick={() => { setEditingModuleId(mod.id); setEditModuleTitle(mod.title); }}
                      title="Rename"
                    >✏️</button>
                    <button style={{...styles.btnIconSm, ...styles.btnIconSmDelete}} onClick={() => handleDeleteModule(mod.id)} title="Delete">×</button>
                  </div>
                </div>

                {!collapsedModules[mod.id] && (
                  <div style={styles.lessonsTree}>
                    {mod.lessons?.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        style={{...styles.lessonTreeItem, ...(activeLesson?.id === lesson.id ? styles.lessonTreeItemActive : {})}}
                        onClick={() => openLesson({ ...lesson, module_id: mod.id })}
                      >
                        <span style={styles.lessonTreeIcon}>📄</span>
                        <span style={styles.lessonTreeTitle}>{lesson.title}</span>
                        <span style={styles.lessonTreeDuration}>{lesson.duration_minutes || 0}m</span>
                        <button
                          style={{...styles.btnIconSm, ...styles.btnIconSmDelete}}
                          onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                          title="Delete"
                        >×</button>
                      </div>
                    ))}

                    {addingLessonToModule === mod.id ? (
                      <div style={styles.addLessonInline}>
                        <input
                          style={styles.addLessonInlineInput}
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          placeholder="Lesson title..."
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddLesson(mod.id);
                            if (e.key === 'Escape') { setAddingLessonToModule(null); setNewLessonTitle(''); }
                          }}
                        />
                        <button onClick={() => handleAddLesson(mod.id)} style={styles.btnAddInline}>+</button>
                      </div>
                    ) : (
                      <button
                        style={styles.btnAddLesson}
                        onClick={() => { setAddingLessonToModule(mod.id); setNewLessonTitle(''); }}
                      >
                        + Add Lesson
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={styles.addModuleSection}>
            <input
              style={styles.addModuleSectionInput}
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="New module title..."
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddModule(); }}
              disabled={isAddingModule}
            />
            <button onClick={handleAddModule} disabled={isAddingModule || !newModuleTitle.trim()} style={styles.btnAddModule}>
              {isAddingModule ? '...' : '+ Module'}
            </button>
          </div>
        </aside>

        {/* ---- Main: Block Editor ---- */}
        <main style={styles.editorMain}>
          {activeLesson ? (
            <div style={styles.lessonEditor}>
              {/* Lesson header */}
              <div style={styles.lessonEditorHeader}>
                <input
                  style={styles.lessonTitleInput}
                  value={lessonTitle}
                  onChange={(e) => { setLessonTitle(e.target.value); setHasChanges(true); }}
                  placeholder="Lesson Title"
                />
                <div style={styles.lessonMetaRow}>
                  <label style={styles.durationLabel}>
                    ⏱️
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={lessonDuration}
                      onChange={(e) => { setLessonDuration(e.target.value); setHasChanges(true); }}
                      style={styles.durationInput}
                    />
                    min
                  </label>
                  <div style={styles.editorModeToggle}>
                    <button
                      style={{...styles.modeBtn, ...(!previewMode ? styles.modeBtnActive : {})}}
                      onClick={() => setPreviewMode(false)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={{...styles.modeBtn, ...(previewMode ? styles.modeBtnActive : {})}}
                      onClick={() => setPreviewMode(true)}
                    >
                      👁️ Preview
                    </button>
                  </div>
                  <button onClick={handleSaveLesson} disabled={isSaving} style={styles.btnSaveLesson}>
                    {isSaving ? 'Saving...' : '💾 Save'}
                  </button>
                </div>
              </div>

              {previewMode ? (
                /* ---- Preview mode ---- */
                <div style={styles.lessonPreview}>
                  <div style={styles.previewLessonTitle}>{lessonTitle}</div>
                  {blocks.map((block) => (
                    <BlockPreview key={block.id} block={block} />
                  ))}
                </div>
              ) : (
                /* ---- Edit mode: Block editor ---- */
                <div style={styles.blocksEditor}>
                  {blocks.map((block, index) => (
                    <div key={block.id} style={styles.blockWrapper}>
                      <BlockEditor
                        block={block}
                        onChange={(updates) => updateBlock(block.id, updates)}
                        onRemove={() => removeBlock(block.id)}
                        onMoveUp={() => moveBlock(block.id, -1)}
                        onMoveDown={() => moveBlock(block.id, 1)}
                        onDuplicate={() => duplicateBlock(block.id)}
                        isFirst={index === 0}
                        isLast={index === blocks.length - 1}
                      />

                      {/* Add block button between blocks */}
                      <div style={styles.blockInsertZone}>
                        <button
                          style={styles.btnInsertBlock}
                          onClick={() => setShowBlockMenu(showBlockMenu === index ? null : index)}
                          title="Add content block"
                        >
                          <span style={styles.insertLine} />
                          <span style={styles.insertIcon}>+</span>
                          <span style={styles.insertLine} />
                        </button>

                        {showBlockMenu === index && (
                          <div style={styles.blockMenu}>
                            <div style={styles.blockMenuHeader}>Add Content Block</div>
                            <div style={styles.blockMenuGrid}>
                              {BLOCK_TYPES.map((bt) => (
                                <button
                                  key={bt.type}
                                  style={styles.blockMenuItem}
                                  onClick={() => addBlockAfter(index, bt.type)}
                                >
                                  <span style={styles.bmiIcon}>{bt.icon}</span>
                                  <div style={styles.bmiInfo}>
                                    <span style={styles.bmiLabel}>{bt.label}</span>
                                    <span style={styles.bmiDesc}>{bt.desc}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Initial add block if empty */}
                  {blocks.length === 0 && (
                    <div style={styles.emptyBlocks}>
                      <p style={styles.emptyBlocksP}>Click below to add your first content block</p>
                      <div style={styles.blockMenuGridInitial}>
                        {BLOCK_TYPES.map((bt) => (
                          <button
                            key={bt.type}
                            style={styles.blockMenuItem}
                            onClick={() => addBlockAfter(-1, bt.type)}
                          >
                            <span style={styles.bmiIcon}>{bt.icon}</span>
                            <div style={styles.bmiInfo}>
                              <span style={styles.bmiLabel}>{bt.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ---- Empty state ---- */
            <div style={styles.editorEmptyState}>
              <div style={styles.emptyIcon}>✨</div>
              <h2 style={styles.emptyStateH2}>Start Building Your Course</h2>
              <p style={styles.emptyStateP}>Select a lesson from the sidebar or create one to start adding content.</p>
              <div style={styles.emptyTips}>
                <div style={styles.tipCard}><span style={styles.tipCardSpan}>📝</span><div><strong style={styles.tipCardStrong}>Rich Text</strong><p style={styles.tipCardP}>Write formatted text with headings and lists</p></div></div>
                <div style={styles.tipCard}><span style={styles.tipCardSpan}>▶️</span><div><strong style={styles.tipCardStrong}>Video Embeds</strong><p style={styles.tipCardP}>Paste YouTube URLs to embed videos</p></div></div>
                <div style={styles.tipCard}><span style={styles.tipCardSpan}>🖼️</span><div><strong style={styles.tipCardStrong}>Images</strong><p style={styles.tipCardP}>Add images via URL with captions</p></div></div>
                <div style={styles.tipCard}><span style={styles.tipCardSpan}>💻</span><div><strong style={styles.tipCardStrong}>Code Blocks</strong><p style={styles.tipCardP}>Add code with language selection</p></div></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ============================================================================
// BlockEditor — Editable view of a single content block
// ============================================================================
const BlockEditor = ({ block, onChange, onRemove, onMoveUp, onMoveDown, onDuplicate, isFirst, isLast }) => {
  const [showActions, setShowActions] = useState(false);

  const blockMeta = BLOCK_TYPES.find((bt) => bt.type === block.type) || BLOCK_TYPES[0];

  return (
    <div
      style={styles.blockEditor}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Block controls */}
      <div style={{...styles.blockControls, ...(showActions ? styles.blockControlsVisible : {})}}>
        <span style={styles.blockTypeBadge}>{blockMeta.icon} {blockMeta.label}</span>
        <div style={styles.blockControlButtons}>
          {!isFirst && <button onClick={onMoveUp} title="Move up" style={styles.ctrlBtn}>↑</button>}
          {!isLast && <button onClick={onMoveDown} title="Move down" style={styles.ctrlBtn}>↓</button>}
          <button onClick={onDuplicate} title="Duplicate" style={styles.ctrlBtn}>⧉</button>
          <button onClick={onRemove} title="Delete block" style={{...styles.ctrlBtn, ...styles.ctrlBtnDanger}}>🗑️</button>
        </div>
      </div>

      {/* Block content */}
      <div style={styles.blockBody}>
        {block.type === 'text' && (
          <TextBlockEditor content={block.content} onChange={(content) => onChange({ content })} />
        )}
        {block.type === 'heading' && (
          <HeadingBlockEditor content={block.content} level={block.level} onChange={onChange} />
        )}
        {block.type === 'code' && (
          <CodeBlockEditor content={block.content} language={block.language} onChange={onChange} />
        )}
        {block.type === 'image' && (
          <ImageBlockEditor url={block.url} alt={block.alt} caption={block.caption} onChange={onChange} />
        )}
        {block.type === 'video' && (
          <VideoBlockEditor url={block.url} caption={block.caption} onChange={onChange} />
        )}
        {block.type === 'callout' && (
          <CalloutBlockEditor content={block.content} calloutType={block.calloutType} onChange={onChange} />
        )}
        {block.type === 'divider' && <div style={styles.dividerBlock}><hr style={styles.dividerBlockHr} /></div>}
        {block.type === 'list' && (
          <ListBlockEditor items={block.items} ordered={block.ordered} onChange={onChange} />
        )}
        {block.type === 'quote' && (
          <QuoteBlockEditor content={block.content} author={block.author} onChange={onChange} />
        )}
      </div>
    </div>
  );
};

// ---- Individual block editors ----

const TextBlockEditor = ({ content, onChange }) => {
  const ref = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  // Sync format toolbar
  const [selectionFormat, setSelectionFormat] = useState({});
  
  useEffect(() => { setLocalContent(content); }, [content]);

  const applyFormat = (tag) => {
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = localContent.substring(start, end);
    let wrapped;
    switch (tag) {
      case 'bold': wrapped = `**${selected}**`; break;
      case 'italic': wrapped = `*${selected}*`; break;
      case 'code': wrapped = `\`${selected}\``; break;
      case 'link': wrapped = `[${selected || 'link text'}](url)`; break;
      case 'strikethrough': wrapped = `~~${selected}~~`; break;
      default: return;
    }
    const newContent = localContent.substring(0, start) + wrapped + localContent.substring(end);
    setLocalContent(newContent);
    onChange(newContent);
  };

  return (
    <div style={{...styles.textBlockEditor, ...(isFocused ? styles.textBlockEditorFocused : {})}}>
      <div style={styles.textFormatBar}>
        <button onClick={() => applyFormat('bold')} title="Bold (Ctrl+B)" style={styles.fmtBtn}><b>B</b></button>
        <button onClick={() => applyFormat('italic')} title="Italic" style={styles.fmtBtn}><i>I</i></button>
        <button onClick={() => applyFormat('strikethrough')} title="Strikethrough" style={styles.fmtBtn}><s>S</s></button>
        <button onClick={() => applyFormat('code')} title="Inline Code" style={{...styles.fmtBtn, ...styles.fmtBtnMono}}>&lt;/&gt;</button>
        <button onClick={() => applyFormat('link')} title="Link" style={styles.fmtBtn}>🔗</button>
      </div>
      <textarea
        ref={ref}
        value={localContent}
        onChange={(e) => { setLocalContent(e.target.value); onChange(e.target.value); }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Write your text here... Use **bold**, *italic*, `code`"
        rows={4}
        style={styles.textBlockTextarea}
      />
    </div>
  );
};

const HeadingBlockEditor = ({ content, level, onChange }) => (
  <div style={styles.headingBlockEditor}>
    <div style={styles.headingLevelSelector}>
      {[1, 2, 3, 4].map((l) => (
        <button
          key={l}
          style={{...styles.levelBtn, ...(level === l ? styles.levelBtnActive : {})}}
          onClick={() => onChange({ level: l })}
        >
          H{l}
        </button>
      ))}
    </div>
    <input
      style={{...styles.headingInput, ...(level === 1 ? styles.headingInputH1 : level === 2 ? styles.headingInputH2 : level === 3 ? styles.headingInputH3 : styles.headingInputH4)}}
      value={content}
      onChange={(e) => onChange({ content: e.target.value })}
      placeholder={`Heading ${level}`}
    />
  </div>
);

const CodeBlockEditor = ({ content, language, onChange }) => (
  <div style={styles.codeBlockEditor}>
    <div style={styles.codeHeader}>
      <select
        value={language}
        onChange={(e) => onChange({ language: e.target.value })}
        style={styles.langSelect}
      >
        {CODE_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
      <span style={styles.codeLabel}>Code Block</span>
    </div>
    <textarea
      style={styles.codeTextarea}
      value={content}
      onChange={(e) => onChange({ content: e.target.value })}
      placeholder="Paste or write your code here..."
      spellCheck={false}
      rows={6}
    />
  </div>
);

const ImageBlockEditor = ({ url, alt, caption, onChange }) => (
  <div style={styles.imageBlockEditor}>
    <div style={styles.imageInputs}>
      <div style={styles.imgInputRow}>
        <span style={styles.inputIcon}>🖼️</span>
        <input
          value={url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="Paste image URL (e.g. https://example.com/image.png)"
          style={styles.imgUrlInput}
        />
      </div>
      <div style={styles.imgInputRow}>
        <span style={styles.inputIcon}>📝</span>
        <input
          value={alt}
          onChange={(e) => onChange({ alt: e.target.value })}
          placeholder="Alt text (accessibility)"
          style={styles.imgUrlInput}
        />
      </div>
      <div style={styles.imgInputRow}>
        <span style={styles.inputIcon}>💬</span>
        <input
          value={caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Caption (optional)"
          style={styles.imgUrlInput}
        />
      </div>
    </div>
    {url && (
      <div style={styles.imagePreviewContainer}>
        <img
          src={url}
          alt={alt || 'Image'}
          style={styles.imagePreviewImg}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div style={{ ...styles.imgError, display: 'none' }}>
          ⚠️ Could not load image — check the URL
        </div>
        {caption && <p style={styles.imgCaption}>{caption}</p>}
      </div>
    )}
  </div>
);

const VideoBlockEditor = ({ url, caption, onChange }) => {
  const embedUrl = getYouTubeEmbedUrl(url);

  return (
    <div style={styles.videoBlockEditor}>
      <div style={styles.videoInputRow}>
        <span style={styles.inputIcon}>▶️</span>
        <input
          value={url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="Paste YouTube URL (e.g. https://youtube.com/watch?v=...)"
          style={styles.videoUrlInput}
        />
      </div>
      <div style={styles.videoInputRow}>
        <span style={styles.inputIcon}>💬</span>
        <input
          value={caption}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Video caption (optional)"
          style={styles.videoUrlInput}
        />
      </div>
      {embedUrl ? (
        <div style={styles.videoEmbedContainer}>
          <iframe
            src={embedUrl}
            title="Video embed"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={styles.videoIframe}
          />
          {caption && <p style={styles.videoCaption}>{caption}</p>}
        </div>
      ) : url ? (
        <div style={styles.videoError}>
          ⚠️ Could not parse video URL. Supported: YouTube links
        </div>
      ) : (
        <div style={styles.videoPlaceholder}>
          <span style={styles.videoPlaceholderSpan}>▶️</span>
          <p>Paste a YouTube link above to embed a video</p>
        </div>
      )}
    </div>
  );
};

const CalloutBlockEditor = ({ content, calloutType, onChange }) => {
  const calloutStyle = CALLOUT_STYLES.find((s) => s.type === calloutType) || CALLOUT_STYLES[0];

  return (
    <div style={{...styles.calloutBlockEditor, borderLeftColor: calloutStyle.color}}>
      <div style={styles.calloutTypeSelector}>
        {CALLOUT_STYLES.map((s) => (
          <button
            key={s.type}
            style={{...styles.calloutTypeBtn, ...(calloutType === s.type ? styles.calloutTypeBtnActive : {})}}
            onClick={() => onChange({ calloutType: s.type })}
            title={s.label}
          >
            {s.icon}
          </button>
        ))}
      </div>
      <div style={styles.calloutContentArea}>
        <span style={styles.calloutIcon}>{calloutStyle.icon}</span>
        <textarea
          value={content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder={`Write your ${calloutStyle.label.toLowerCase()} here...`}
          rows={2}
          style={styles.calloutTextarea}
        />
      </div>
    </div>
  );
};

const ListBlockEditor = ({ items = [''], ordered, onChange }) => {
  const updateItem = (index, value) => {
    const updated = [...items];
    updated[index] = value;
    onChange({ items: updated });
  };

  const addItem = () => onChange({ items: [...items, ''] });

  const removeItem = (index) => {
    if (items.length <= 1) return;
    onChange({ items: items.filter((_, i) => i !== index) });
  };

  return (
    <div style={styles.listBlockEditor}>
      <div style={styles.listTypeToggle}>
        <button style={{...styles.listTypeBtn, ...(!ordered ? styles.listTypeBtnActive : {})}} onClick={() => onChange({ ordered: false })}>
          • Bullet
        </button>
        <button style={{...styles.listTypeBtn, ...(ordered ? styles.listTypeBtnActive : {})}} onClick={() => onChange({ ordered: true })}>
          1. Numbered
        </button>
      </div>
      <div style={styles.listItems}>
        {items.map((item, i) => (
          <div key={i} style={styles.listItemRow}>
            <span style={styles.listMarker}>{ordered ? `${i + 1}.` : '•'}</span>
            <input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder="List item..."
              style={styles.listItemInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addItem(); }
                if (e.key === 'Backspace' && !item && items.length > 1) { e.preventDefault(); removeItem(i); }
              }}
            />
            {items.length > 1 && (
              <button style={styles.btnRemoveListItem} onClick={() => removeItem(i)}>×</button>
            )}
          </div>
        ))}
      </div>
      <button style={styles.btnAddListItem} onClick={addItem}>+ Add item</button>
    </div>
  );
};

const QuoteBlockEditor = ({ content, author, onChange }) => (
  <div style={styles.quoteBlockEditor}>
    <textarea
      value={content}
      onChange={(e) => onChange({ content: e.target.value })}
      placeholder="Enter quote text..."
      rows={3}
      style={styles.quoteTextarea}
    />
    <input
      value={author}
      onChange={(e) => onChange({ author: e.target.value })}
      placeholder="— Author (optional)"
      style={styles.quoteAuthor}
    />
  </div>
);

// ============================================================================
// BlockPreview — Read-only rendered view of a block (Preview mode)
// ============================================================================
const BlockPreview = ({ block }) => {
  switch (block.type) {
    case 'text':
      return <div style={styles.previewText}>{renderInlineMarkdown(block.content)}</div>;
    case 'heading': {
      const Tag = `h${block.level || 2}`;
      return <Tag style={styles.previewHeading}>{block.content}</Tag>;
    }
    case 'code':
      return (
        <div style={styles.previewCode}>
          {block.language && <span style={styles.codeLangBadge}>{block.language}</span>}
          <pre style={styles.previewCodePre}><code style={styles.previewCodeCode}>{block.content}</code></pre>
        </div>
      );
    case 'image':
      return block.url ? (
        <figure style={styles.previewImage}>
          <img src={block.url} alt={block.alt || ''} style={styles.previewImageImg} />
          {block.caption && <figcaption style={styles.previewImageCaption}>{block.caption}</figcaption>}
        </figure>
      ) : null;
    case 'video': {
      const embedUrl = getYouTubeEmbedUrl(block.url);
      return embedUrl ? (
        <div style={styles.previewVideo}>
          <iframe src={embedUrl} title="Video" allowFullScreen style={styles.videoIframe} />
          {block.caption && <p style={styles.videoCaption}>{block.caption}</p>}
        </div>
      ) : null;
    }
    case 'callout': {
      const calloutStyle = CALLOUT_STYLES.find((s) => s.type === block.calloutType) || CALLOUT_STYLES[0];
      return (
        <div style={{ ...styles.previewCallout, borderLeftColor: calloutStyle.color, background: calloutStyle.color + '10' }}>
          <span style={styles.calloutPreviewIcon}>{calloutStyle.icon}</span>
          <p style={styles.previewCalloutP}>{block.content}</p>
        </div>
      );
    }
    case 'divider':
      return <hr style={styles.previewDivider} />;
    case 'list':
      return block.ordered ? (
        <ol style={styles.previewList}>{block.items?.map((item, i) => <li key={i}>{item}</li>)}</ol>
      ) : (
        <ul style={styles.previewList}>{block.items?.map((item, i) => <li key={i}>{item}</li>)}</ul>
      );
    case 'quote':
      return (
        <blockquote style={styles.previewQuote}>
          <p style={styles.previewQuoteP}>{block.content}</p>
          {block.author && <cite style={styles.previewQuoteCite}>— {block.author}</cite>}
        </blockquote>
      );
    default:
      return <p>{block.content}</p>;
  }
};

// Simple inline markdown renderer for preview text blocks
const renderInlineMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    // Process inline formatting
    let processed = line;
    const parts = [];
    let key = 0;
    let remaining = processed;

    while (remaining.length > 0) {
      let match;
      match = remaining.match(/`([^`]+)`/);
      if (match) {
        const idx = match.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.substring(0, idx)}</span>);
        parts.push(<code key={key++} style={styles.mdInlineCode}>{match[1]}</code>);
        remaining = remaining.substring(idx + match[0].length);
        continue;
      }
      match = remaining.match(/\*\*([^*]+)\*\*/);
      if (match) {
        const idx = match.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.substring(0, idx)}</span>);
        parts.push(<strong key={key++}>{match[1]}</strong>);
        remaining = remaining.substring(idx + match[0].length);
        continue;
      }
      match = remaining.match(/\*([^*]+)\*/);
      if (match) {
        const idx = match.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.substring(0, idx)}</span>);
        parts.push(<em key={key++}>{match[1]}</em>);
        remaining = remaining.substring(idx + match[0].length);
        continue;
      }
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    return <React.Fragment key={i}>{parts}{i < text.split('\n').length - 1 && <br />}</React.Fragment>;
  });
};

export default CourseEditor;
